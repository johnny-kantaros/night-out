import Foundation

@MainActor
final class PlaceDetailViewModel: ObservableObject {
    @Published var userPlace: UserPlace
    @Published var rating: Double
    @Published var notes: String
    @Published var isSaving = false
    @Published var errorMessage: String?

    private let client = APIClient.shared

    init(userPlace: UserPlace) {
        self.userPlace = userPlace
        self.rating = userPlace.rating ?? 0
        self.notes = userPlace.notes ?? ""
    }

    func saveRating() async {
        isSaving = true
        defer { isSaving = false }
        do {
            userPlace = try await client.ratePlace(
                userPlaceId: userPlace.id,
                rating: rating,
                notes: notes.isEmpty ? nil : notes,
                visited: true
            )
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
