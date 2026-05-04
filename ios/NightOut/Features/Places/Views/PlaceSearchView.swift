import SwiftUI
import CoreLocation

struct PlaceSearchView: View {
    @StateObject private var vm = PlaceSearchViewModel()
    @Environment(\.dismiss) var dismiss

    // Default to NYC until real location is wired in
    private let coordinate = CLLocationCoordinate2D(latitude: 40.7128, longitude: -74.0060)

    var body: some View {
        NavigationStack {
            List(vm.results) { result in
                Button {
                    Task {
                        _ = try? await vm.addPlace(result)
                        dismiss()
                    }
                } label: {
                    VStack(alignment: .leading) {
                        Text(result.name).font(.headline)
                        Text(result.address).font(.caption).foregroundStyle(.secondary)
                        Text(result.category.rawValue.capitalized)
                            .font(.caption2)
                            .foregroundStyle(.blue)
                    }
                }
            }
            .navigationTitle("Find a Place")
            .searchable(text: $vm.query, prompt: "Restaurant, bar, cafe…")
            .onSubmit(of: .search) {
                Task { await vm.search(near: coordinate) }
            }
            .overlay {
                if vm.isSearching { ProgressView() }
            }
        }
    }
}
