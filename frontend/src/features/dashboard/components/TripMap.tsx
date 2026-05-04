import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GPSPoint } from '../../../types/trip.types';
import {
    sortGPSPointsByTimestamp,
    validateGPSPoints,
    detectOverspeedSections,
    detectStoppages,
    detectIdlingPoints,
} from '../../../utils/mapUtils';
import { formatDuration, formatSpeed } from '../../../utils/tripUtils';
import '../styles/map.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface TripMapProps {
    gpsPoints: GPSPoint[];
    tripName: string;
    speedLimit?: number;
    showStoppages?: boolean;
    showIdling?: boolean;
    color?: string;
    activePointIndex?: number | null;
}

const TripMap: React.FC<TripMapProps> = ({
    gpsPoints,
    tripName,
    speedLimit = 80,
    showStoppages = true,
    showIdling = true,
    color = '#3B82F6',
    activePointIndex,
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const vehicleMarkerRef = useRef<L.Marker | null>(null);
    const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
    const tileLayersRef = useRef<{ [key: string]: L.TileLayer }>({});


    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Initialize map only once
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, {
                center: [0, 0],
                zoom: 13,
                zoomControl: false, 
            });

            // Initialize all tile layers
            tileLayersRef.current.standard = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20
            });

            tileLayersRef.current.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 19
            });

            tileLayersRef.current.hybrid = L.layerGroup([
                tileLayersRef.current.satellite,
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
                    subdomains: 'abcd',
                    maxZoom: 20
                })
            ]) as unknown as L.TileLayer;

            // Add default layer
            tileLayersRef.current.standard.addTo(mapRef.current);

            // Add zoom control to bottom right
            L.control.zoom({
                position: 'bottomright'
            }).addTo(mapRef.current);
        }

        // Handle Map Type Switching
        Object.values(tileLayersRef.current).forEach(layer => {
            if (mapRef.current?.hasLayer(layer)) {
                mapRef.current.removeLayer(layer);
            }
        });
        
        if (mapType === 'standard') tileLayersRef.current.standard.addTo(mapRef.current);
        if (mapType === 'satellite') tileLayersRef.current.satellite.addTo(mapRef.current);
        if (mapType === 'hybrid') tileLayersRef.current.hybrid.addTo(mapRef.current);

        // Clear existing layers (except tile layers and vehicle marker)
        mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.TileLayer || layer instanceof L.LayerGroup) return;
            if (layer === vehicleMarkerRef.current) return;
            mapRef.current?.removeLayer(layer);
        });

        // Validate and sort GPS points
        const validPoints = validateGPSPoints(gpsPoints);
        if (validPoints.length === 0) return;

        const sortedPoints = sortGPSPointsByTimestamp(validPoints);
        
        // Determine current index for playback
        let currentIndex = (activePointIndex !== undefined && activePointIndex !== null) 
            ? activePointIndex 
            : sortedPoints.length - 1;
        
        // Safety check for bounds
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex >= sortedPoints.length) currentIndex = sortedPoints.length - 1;

        const activePoint = sortedPoints[currentIndex];

        // --- DRAWING LOGIC ---

        if (sortedPoints.length > 1) {
            // Draw FULL historical path in a faint color (Ghost Path)
            const fullCoords: [number, number][] = sortedPoints.map(p => [p.latitude, p.longitude]);
            L.polyline(fullCoords, { color: '#CBD5E1', weight: 3, opacity: 0.4, dashArray: '5, 10' }).addTo(mapRef.current!);

            // Points up to current playback index
            const traveledPoints = sortedPoints.slice(0, currentIndex + 1);

            if (traveledPoints.length > 1) {
                const overspeedSections = detectOverspeedSections(traveledPoints, speedLimit);
                const overspeedIndices = new Set<number>();

                overspeedSections.forEach(section => {
                    for (let i = section.startIndex; i <= section.endIndex; i++) {
                        overspeedIndices.add(i);
                    }
                });

                // Helper to draw path with depth (shadow effect)
                const drawPathWithDepth = (coords: [number, number][], pathColor: string, weight: number, opacity: number) => {
                    // Shadow/Depth line
                    L.polyline(coords, { 
                        color: '#000', 
                        weight: weight + 2, 
                        opacity: 0.1,
                        lineJoin: 'round',
                        lineCap: 'round'
                    }).addTo(mapRef.current!);
                    
                    // Main line
                    return L.polyline(coords, { 
                        color: pathColor, 
                        weight, 
                        opacity,
                        lineJoin: 'round',
                        lineCap: 'round'
                    }).addTo(mapRef.current!);
                };

                // Draw main path segments for traveled part
                let currentSegment: [number, number][] = [];
                for (let i = 0; i < traveledPoints.length; i++) {
                    const point = traveledPoints[i];
                    if (!overspeedIndices.has(i)) {
                        currentSegment.push([point.latitude, point.longitude]);
                    } else {
                        if (currentSegment.length > 1) {
                            drawPathWithDepth(currentSegment, color, 4, 0.8);
                        }
                        currentSegment = [[point.latitude, point.longitude]]; 
                    }
                }
                if (currentSegment.length > 1) {
                    drawPathWithDepth(currentSegment, color, 4, 0.8);
                }

                // Draw overspeed sections in red
                overspeedSections.forEach(section => {
                    const coords: [number, number][] = section.points.map(p => [p.latitude, p.longitude]);
                    drawPathWithDepth(coords, '#EF4444', 5, 1.0)
                        .bindPopup(`
                            <div class="map-popup overspeed">
                              <h4>⚠️ Overspeed Section</h4>
                              <p><strong>Max Speed:</strong> ${formatSpeed(section.maxSpeed)}</p>
                              <p><strong>Points:</strong> ${section.points.length}</p>
                            </div>
                        `);
                });
            }

            // Add start/end markers with modern SVG icons
            const startIcon = L.divIcon({ 
                className: 'modern-marker start', 
                html: `
                    <div class="marker-container">
                        <div class="marker-pulse"></div>
                        <div class="marker-inner">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" transform="rotate(45 12 12)"/>
                            </svg>
                        </div>
                    </div>
                `, 
                iconSize: [32, 32], 
                iconAnchor: [16, 16] 
            });

            const endIcon = L.divIcon({ 
                className: 'modern-marker end', 
                html: `
                    <div class="marker-container">
                        <div class="marker-inner">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/>
                            </svg>
                        </div>
                    </div>
                `, 
                iconSize: [32, 32], 
                iconAnchor: [16, 16] 
            });

            L.marker([sortedPoints[0].latitude, sortedPoints[0].longitude], { icon: startIcon }).addTo(mapRef.current!).bindPopup('Trip Start');
            L.marker([sortedPoints[sortedPoints.length - 1].latitude, sortedPoints[sortedPoints.length - 1].longitude], { icon: endIcon }).addTo(mapRef.current!).bindPopup('Trip End');

            // Add stoppages
            if (showStoppages) {
                detectStoppages(sortedPoints).forEach((s, i) => {
                    const icon = L.divIcon({ 
                        className: 'modern-marker stoppage', 
                        html: `
                            <div class="marker-container smaller">
                                <div class="marker-inner">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                        <path d="M18.17 4.91L12 18.17l-6.17-13.26L12 2l6.17 2.91zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                </div>
                            </div>
                        `, 
                        iconSize: [24, 24], 
                        iconAnchor: [12, 12] 
                    });
                    L.marker([s.location.lat, s.location.lng], { icon }).addTo(mapRef.current!)
                        .bindPopup(`🅿️ Stoppage #${i+1}<br>Duration: ${formatDuration(s.duration)}`);
                });
            }

            // Add idling
            if (showIdling) {
                detectIdlingPoints(sortedPoints).forEach((id, i) => {
                    const icon = L.divIcon({ 
                        className: 'modern-marker idling', 
                        html: `
                            <div class="marker-container smaller">
                                <div class="marker-inner">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2C11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                                    </svg>
                                </div>
                            </div>
                        `, 
                        iconSize: [24, 24], 
                        iconAnchor: [12, 12] 
                    });
                    L.marker([id.location.lat, id.location.lng], { icon }).addTo(mapRef.current!)
                        .bindPopup(`⏸️ Idling #${i+1}<br>Duration: ${formatDuration(id.duration)}`);
                });
            }

            // Auto-fit map ONLY on initial load or if not replaying
            if (activePointIndex === undefined || activePointIndex === null || activePointIndex === sortedPoints.length - 1) {
                const bounds = L.latLngBounds(sortedPoints.map(p => [p.latitude, p.longitude]));
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
        } else if (sortedPoints.length === 1) {
            // Single point case
            const point = sortedPoints[0];
            mapRef.current.setView([point.latitude, point.longitude], 15);
        }

        // --- LIVE VEHICLE MARKER ---
        if (activePoint) {
            const vehicleIcon = L.divIcon({
                className: 'live-vehicle-icon',
                html: `
                    <div class="vehicle-navigation-marker" style="transform: rotate(${activePoint.heading || 0}deg);">
                        <div class="navigation-arrow-shadow"></div>
                        <div class="navigation-arrow-main">
                            <svg viewBox="0 0 24 24" width="28" height="28">
                                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" fill="#4F46E5" stroke="white" stroke-width="1.5" />
                            </svg>
                        </div>
                        <div class="navigation-pulse"></div>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            if (vehicleMarkerRef.current) {
                vehicleMarkerRef.current.setLatLng([activePoint.latitude, activePoint.longitude]);
                vehicleMarkerRef.current.setIcon(vehicleIcon);
            } else {
                vehicleMarkerRef.current = L.marker([activePoint.latitude, activePoint.longitude], { 
                    icon: vehicleIcon, 
                    zIndexOffset: 1000 
                }).addTo(mapRef.current!);
            }

            vehicleMarkerRef.current.bindTooltip(`
                <div style="padding: 4px 8px; font-weight: 600;">
                    ${formatSpeed(activePoint.speed)}<br>
                    <span style="font-size: 10px; color: #64748b;">${new Date(activePoint.timestamp).toLocaleTimeString()}</span>
                </div>
            `, { permanent: false, direction: 'top' });
        }

    }, [gpsPoints, tripName, speedLimit, showStoppages, showIdling, color, activePointIndex, mapType]);

    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return (
        <div className="trip-map-container" style={{ position: 'relative' }}>
            {/* Live Status Badge */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 1000,
                background: mapType === 'standard' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                padding: '8px 12px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: '700',
                border: mapType === 'standard' ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                color: mapType === 'standard' ? '#4a5568' : '#f8fafc',
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: gpsPoints.length > 0 ? '#10b981' : '#94a3b8',
                    boxShadow: gpsPoints.length > 0 ? '0 0 8px #10b981' : 'none'
                }}></div>
                <span>
                    {gpsPoints.length > 0 ? `RECEIVING DATA (${gpsPoints.length})` : 'WAITING...'}
                </span>
            </div>

            {/* Map Type Toggle */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                display: 'flex',
                background: mapType === 'standard' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                padding: '4px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                border: mapType === 'standard' ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s ease'
            }}>
                {[
                    { id: 'standard', label: 'Clean' },
                    { id: 'satellite', label: 'Satellite' },
                    { id: 'hybrid', label: 'Hybrid' }
                ].map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setMapType(type.id as any)}
                        style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: '800',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: mapType === type.id ? '#4F46E5' : 'transparent',
                            color: mapType === type.id ? 'white' : (mapType === 'standard' ? '#64748b' : '#94a3b8'),
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                        }}
                    >
                        {type.label}
                    </button>
                ))}
            </div>
            <div ref={mapContainerRef} className="trip-map" />
        </div>
    );
};

export default TripMap;
