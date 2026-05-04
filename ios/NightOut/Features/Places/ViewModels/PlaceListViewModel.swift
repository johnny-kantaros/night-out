import Foundation

@MainActor
final class PlaceListViewModel: ObservableObject {
    @Published var userPlaces: [UserPlace] = []
    @Published var errorMessage: String?

    private let client = APIClient.shared

    func load() async {
        do {
            userPlaces = try await client.myPlaces()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
