import { useEffect, useRef } from 'react';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  latitude: number;
  longitude: number;
  address: string;
}

function MapPicker({ latitude, longitude, address }: MapPickerProps) {
  const map_ref = useRef<L.Map | null>(null);
  const marker_ref = useRef<L.Marker | null>(null);
  const container_ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container_ref.current) return;

    if (!map_ref.current) {
      map_ref.current = L.map(container_ref.current).setView(
        [latitude, longitude],
        14
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map_ref.current);

      marker_ref.current = L.marker([latitude, longitude])
        .addTo(map_ref.current)
        .bindPopup(address)
        .openPopup();
    } else {
      map_ref.current.setView([latitude, longitude], 14);

      if (marker_ref.current) {
        marker_ref.current.setLatLng([latitude, longitude]);
        marker_ref.current.setPopupContent(address);
        marker_ref.current.openPopup();
      }
    }
  }, [latitude, longitude, address]);

  useEffect(() => {
    return () => {
      if (map_ref.current) {
        map_ref.current.remove();
        map_ref.current = null;
      }
    };
  }, []);

  return (
    <div className="map-wrapper">
      <div ref={container_ref} className="map-container" />
      <p className="map-caption">📍 {address}</p>
    </div>
  );
}

export default MapPicker;
