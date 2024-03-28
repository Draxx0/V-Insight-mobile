import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Button,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Sanitaries } from '~/types';
import { colors } from '~/constants';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Divider from '~/components/common/Divider';
import { useTranslation } from 'react-i18next';
import PressableButton from '~/components/common/PressableButton';
import FillButton from '~/components/common/FillButton';

type Props = {
  visible: boolean;
  data: Sanitaries | null;
  onClose: () => void;
  walkingTime: string | null;
};
export default function SanitaryBottomSheet({
  data,
  visible,
  onClose,
  walkingTime,
}: Props) {
  const { t } = useTranslation();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['65%', '85%'], []);

  const handleOpenMaps = () => {
    if (data) {
      const { geo_point_2d } = data;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${geo_point_2d.lat},${geo_point_2d.lon}`;
      Linking.openURL(url);
      onClose();
    }
  };

  const renderServices = useCallback(() => {
    if (!data) return null;

    return (
      <View style={{ ...styles.rowContainer, gap: 20 }}>
        {data.acces_pmr === 'Oui' && (
          <View style={styles.rowContainer}>
            <FontAwesome name="wheelchair" size={16} color={colors.main} />
            <Text style={styles.text}>
              {t('screens.home.index.sanitaryPmrAccessibility')}
            </Text>
          </View>
        )}

        {data.relais_bebe === 'Oui' && (
          <View style={styles.rowContainer}>
            <FontAwesome5 name="baby" size={16} color={colors.main} />
            <Text style={styles.text}>
              {t('screens.home.index.sanitaryBabyRelay')}
            </Text>
          </View>
        )}

        {data.relais_bebe === 'Non' && data.acces_pmr === 'Non' && (
          <Text style={styles.text}>
            {t('screens.home.index.sanitaryNoServices')}
          </Text>
        )}
      </View>
    );
  }, [data]);

  return (
    visible &&
    data && (
      <View style={styles.container}>
        <BottomSheet
          backdropComponent={() => (
            <View style={{ flex: 1, backgroundColor: 'transparent' }} />
          )}
          snapPoints={snapPoints}
          ref={bottomSheetRef}
          enableContentPanningGesture
          enablePanDownToClose
          onClose={onClose}
          handleIndicatorStyle={{
            backgroundColor: colors.main,
          }}
          handleStyle={{
            backgroundColor: colors.black,
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
          }}
        >
          <BottomSheetView style={styles.contentContainer}>
            <Text style={styles.title}>{data.type}</Text>

            <View style={styles.rowContainer}>
              <FontAwesome name="map-pin" size={16} color={colors.main} />
              <Text style={styles.text}>
                {t('screens.home.index.sanitaryAdress', {
                  adress: data.adresse,
                }) || t('screens.home.index.sanitaryNoAddress')}
              </Text>
            </View>

            <View style={styles.rowContainer}>
              <FontAwesome name="clock-o" size={16} color={colors.main} />
              <Text style={styles.text}>
                {!data.horaire ? (
                  t('screens.home.index.sanitaryEmptyOpenHours')
                ) : data.horaire.includes('Voir fiche') &&
                  data.url_fiche_equipement ? (
                  <PressableButton
                    onPress={() => Linking.openURL(data.url_fiche_equipement!)}
                  >
                    <Text>{t('screens.home.index.sanitaryOpenCard')}</Text>
                  </PressableButton>
                ) : (
                  t('screens.home.index.sanitaryOpenHours', {
                    openHours: data.horaire,
                  })
                )}
              </Text>
            </View>

            <View style={styles.rowContainer}>
              <FontAwesome5 name="walking" size={16} color={colors.main} />

              {!walkingTime ? (
                <ActivityIndicator size="small" color={colors.main} />
              ) : (
                <View style={styles.rowContainer}>
                  <Text style={styles.text}>
                    {t('screens.home.index.sanitaryItinerary', { walkingTime })}
                  </Text>
                </View>
              )}
            </View>

            <Divider />

            <Text style={styles.title}>
              {t('screens.home.index.sanitaryServiceLabel')}
            </Text>

            {renderServices()}

            <Divider />

            <View style={styles.rowContainer}>
              <FillButton onPress={onClose}>
                {t('screens.home.index.sanitaryCloseLabel')}
              </FillButton>
              <FillButton onPress={handleOpenMaps}>
                {t('screens.home.index.santaryOpenIntinerary')}
              </FillButton>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 20,
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 16,
    backgroundColor: colors.black,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.main,
    textTransform: 'capitalize',
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },
});