import Foundation
import CoreLocation

@MainActor
final class MapViewModel: ObservableObject {
    @Published var userPlaces: [UserPlace] = []
    @Published var errorMessage: String?

    private let client = APIClient.shared

    func loadPlaces() async {
        do {
            userPlaces = try await client.myPlaces()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
