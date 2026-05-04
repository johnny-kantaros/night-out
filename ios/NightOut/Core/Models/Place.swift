import Foundation

enum PlaceCategory: String, Codable {
    case bar, restaurant, cafe
}

enum PlaceSource: String, Codable {
    case google, foursquare, osm
}

struct Place: Codable, Identifiable {
    let id: UUID
    let name: String
    let lat: Double
    let lng: Double
    let category: PlaceCategory
    let address: String
    let phone: String?
    let website: String?
    let source: PlaceSource
    let externalId: String
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, name, lat, lng, category, address, phone, website, source
        case externalId = "external_id"
        case createdAt = "created_at"
    }
}

struct UserPlace: Codable, Identifiable {
    let id: UUID
    let place: Place
    var rating: Double?
    var notes: String?
    var visited: Bool
    var wantToVisit: Bool
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, place, rating, notes, visited
        case wantToVisit = "want_to_visit"
        case createdAt = "created_at"
    }
}

struct PlaceSearchResult: Codable, Identifiable {
    var id: String { "\(source.rawValue):\(externalId)" }
    let externalId: String
    let source: PlaceSource
    let name: String
    let lat: Double
    let lng: Double
    let category: PlaceCategory
    let address: String
    let phone: String?
    let website: String?
    let rating: Double?

    enum CodingKeys: String, CodingKey {
        case source, name, lat, lng, category, address, phone, website, rating
        case externalId = "external_id"
    }
}
