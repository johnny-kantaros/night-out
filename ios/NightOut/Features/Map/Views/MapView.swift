import SwiftUI
// TODO: import Mapbox SDK once added via SPM

struct MapView: View {
    @StateObject private var vm = MapViewModel()

    var body: some View {
        NavigationStack {
            // Mapbox MGLMapView will replace this placeholder
            ZStack {
                Color.gray.opacity(0.1).ignoresSafeArea()
                Text("Map coming soon\n(\(vm.userPlaces.count) places saved)")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }
            .navigationTitle("Map")
            .task { await vm.loadPlaces() }
        }
    }
}
