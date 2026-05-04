import SwiftUI

struct PlaceListView: View {
    @StateObject private var vm = PlaceListViewModel()

    var body: some View {
        NavigationStack {
            List(vm.userPlaces) { up in
                NavigationLink(destination: PlaceDetailView(userPlace: up)) {
                    PlaceRowView(userPlace: up)
                }
            }
            .navigationTitle("My Places")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    NavigationLink(destination: PlaceSearchView()) {
                        Image(systemName: "plus")
                    }
                }
            }
            .task { await vm.load() }
            .refreshable { await vm.load() }
        }
    }
}

struct PlaceRowView: View {
    let userPlace: UserPlace

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(userPlace.place.name).font(.headline)
            Text(userPlace.place.address).font(.caption).foregroundStyle(.secondary)
            if let rating = userPlace.rating {
                Text(String(format: "%.1f ★", rating)).font(.caption).foregroundStyle(.orange)
            }
        }
        .padding(.vertical, 4)
    }
}
