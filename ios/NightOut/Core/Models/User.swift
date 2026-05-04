import Foundation

struct User: Codable, Identifiable {
    let id: UUID
    let username: String
    let email: String
    let displayName: String
    let avatarUrl: String?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, username, email
        case displayName = "display_name"
        case avatarUrl = "avatar_url"
        case createdAt = "created_at"
    }
}

struct TokenResponse: Codable {
    let accessToken: String
    let tokenType: String

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case tokenType = "token_type"
    }
}
