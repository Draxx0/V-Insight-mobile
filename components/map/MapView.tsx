import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MAPCONSTANTS } from '~/constants/map.constants';
import * as Location from 'expo-location';
import { useSanitariesStore } from '~/store/sanitaries.store';
import { Sanitaries } from '~/types';
import { colors } from '~/constants';
import { Filters } from '~/types/filters';
import { SANITARIES } from '~/constants/sanitaries.constants';
import { calculateWalkingTime } from '~/utils/functions/getWalkingTime';
import { useUserLocationStore } from '~/store/user-location.store';
import { handleMarkerPress } from '~/utils/functions/handleMarkerPress';

type Props = {
  setMenuVisible: (visible: boolean) => void;
  setSelectedSanitary: (marker: Sanitaries) => void;
  selectedFilter: Filters[];
  setWalkingTime: (time: string | null) => void;
  mapRef: React.RefObject<MapView>;
};

export default function MapViewComp({
  setMenuVisible,
  setSelectedSanitary,
  selectedFilter,
  setWalkingTime,
  mapRef,
}: Props) {
  const { sanitaries, setSanitaries } = useSanitariesStore();
  const { location, setLocation } = useUserLocationStore();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let locationSubscription = await Location.watchPositionAsync(
        {},
        (newLocation) => {
          setLocation(newLocation);
        }
      );

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    })();
  }, []);

  const handleGetNearestSanitaries = ({
    lat,
    lon,
  }: {
    lat: number;
    lon: number;
  }) => {
    let sortedSanitaries = [...SANITARIES];

    if (selectedFilter.length > 0) {
      return;
    }

    sortedSanitaries.sort((a: Sanitaries, b: Sanitaries) => {
      const distanceA = Math.sqrt(
        Math.pow(a.geo_point_2d.lat - lat, 2) +
          Math.pow(a.geo_point_2d.lon - lon, 2)
      );
      const distanceB = Math.sqrt(
        Math.pow(b.geo_point_2d.lat - lat, 2) +
          Math.pow(b.geo_point_2d.lon - lon, 2)
      );
      return distanceA - distanceB;
    });
    setSanitaries(sortedSanitaries.slice(0, MAPCONSTANTS.sanitariesMaxVisible));
  };

  const detectPinImage = (sanitary: Sanitaries) => {
    return sanitary.type === 'SANISETTE' ||
      sanitary.type === 'TOILETTES' ||
      'WC PUBLICS PERMANENTS'
      ? require('~/assets/images/pin_toilettes.png')
      : sanitary.type === 'URINOIR'
      ? require('~/assets/images/pin_urinoir.png')
      : require('~/assets/images/marker.png');
  };

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      ref={mapRef}
      style={styles.map}
      showsTraffic={false}
      customMapStyle={[...MAPCONSTANTS.customMap]}
      userLocationPriority="high"
      accessibilityElementsHidden={true}
      followsUserLocation={true}
      showsUserLocation={true}
      showsCompass={false}
      loadingEnabled={true}
      loadingIndicatorColor={colors.main}
      onRegionChangeComplete={(region) => {
        handleGetNearestSanitaries({
          lat: region.latitude,
          lon: region.longitude,
        });
      }}
      initialRegion={
        location
          ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
          : {
              ...MAPCONSTANTS.initialRegion,
            }
      }
    >
      {sanitaries.map((sanitary: Sanitaries, index: number) => (
        <Marker
          key={index}
          coordinate={{
            latitude: sanitary.geo_point_2d.lat,
            longitude: sanitary.geo_point_2d.lon,
          }}
          icon={detectPinImage(sanitary)}
          onPress={() =>
            handleMarkerPress({
              sanitary,
              setMenuVisible,
              setSelectedSanitary,
              location,
              setWalkingTime,
            })
          }
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapDisabled: {
    flex: 1,
    height: '100%',
    opacity: 0.2,
  },
});
