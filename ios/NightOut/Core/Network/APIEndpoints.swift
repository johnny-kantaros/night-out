// Typed wrappers around APIClient for each resource.
import Foundation

extension APIClient {
    // MARK: - Auth

    func register(username: String, email: String, password: String, displayName: String) async throws -> TokenResponse {
        try await post("auth/register", body: [
            "username": username, "email": email,
            "password": password, "display_name": displayName,
        ])
    }

    func login(username: String, password: String) async throws -> TokenResponse {
        // OAuth2 form encoding
        var req = URLRequest(url: URL(string: "https://night-out-api.fly.dev/api/v1/auth/login")!)
        req.httpMethod = "POST"
        req.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        req.httpBody = "username=\(username)&password=\(password)".data(using: .utf8)
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode(TokenResponse.self, from: data)
    }

    // MARK: - Users

    func me() async throws -> User {
        try await get("users/me")
    }

    // MARK: - Places

    func searchPlaces(query: String, lat: Double, lng: Double) async throws -> [PlaceSearchResult] {
        try await get("places/search?q=\(query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query)&lat=\(lat)&lng=\(lng)")
    }

    func addPlace(source: PlaceSource, externalId: String) async throws -> UserPlace {
        try await post("places", body: ["source": source.rawValue, "external_id": externalId])
    }

    func myPlaces() async throws -> [UserPlace] {
        try await get("places")
    }

    func ratePlace(userPlaceId: UUID, rating: Double, notes: String?, visited: Bool) async throws -> UserPlace {
        struct Body: Encodable { let rating: Double; let notes: String?; let visited: Bool }
        return try await patch("places/\(userPlaceId)/rating", body: Body(rating: rating, notes: notes, visited: visited))
    }
}
