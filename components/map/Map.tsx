import { View, StyleSheet } from 'react-native';
import MapViewComp from './MapView';
import SanitaryBottomSheet from './sanitaryDetails/SanitaryBottomSheet';
import { useState } from 'react';
import { Sanitaries } from '~/types';
import Filters from './Filters';
import { Filters as IFilters } from '~/types/filters';

export default function Map() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSanitary, setSelectedSanitary] = useState<Sanitaries | null>(
    null
  );
  const [selectedFilters, setSelectedFilters] = useState<IFilters[]>([]);
  const [walkingTime, setWalkingTime] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedSanitary(null);
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <MapViewComp
        setSelectedSanitary={setSelectedSanitary}
        setMenuVisible={setMenuVisible}
        selectedFilter={selectedFilters}
        setWalkingTime={setWalkingTime}
      />
      {menuVisible && (
        <SanitaryBottomSheet
          visible={menuVisible}
          data={selectedSanitary}
          onClose={handleClose}
          walkingTime={walkingTime}
        />
      )}
      <Filters
        selectedFilter={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
});