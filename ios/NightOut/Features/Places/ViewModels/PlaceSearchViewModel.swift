import Foundation
import CoreLocation

@MainActor
final class PlaceSearchViewModel: ObservableObject {
    @Published var query = ""
    @Published var results: [PlaceSearchResult] = []
    @Published var isSearching = false
    @Published var errorMessage: String?

    private let client = APIClient.shared

    func search(near coordinate: CLLocationCoordinate2D) async {
        guard !query.isEmpty else { return }
        isSearching = true
        errorMessage = nil
        defer { isSearching = false }
        do {
            results = try await client.searchPlaces(query: query, lat: coordinate.latitude, lng: coordinate.longitude)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func addPlace(_ result: PlaceSearchResult) async throws -> UserPlace {
        try await client.addPlace(source: result.source, externalId: result.externalId)
    }
}
