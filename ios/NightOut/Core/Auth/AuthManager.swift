import Foundation

@MainActor
final class AuthManager: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false

    private let client = APIClient.shared

    init() {
        if client.token != nil {
            Task { await refreshCurrentUser() }
        }
    }

    func login(username: String, password: String) async throws {
        let token = try await client.login(username: username, password: password)
        client.token = token.accessToken
        await refreshCurrentUser()
    }

    func register(username: String, email: String, password: String, displayName: String) async throws {
        let token = try await client.register(username: username, email: email, password: password, displayName: displayName)
        client.token = token.accessToken
        await refreshCurrentUser()
    }

    func logout() {
        client.token = nil
        currentUser = nil
        isAuthenticated = false
    }

    private func refreshCurrentUser() async {
        do {
            currentUser = try await client.me()
            isAuthenticated = true
        } catch {
            logout()
        }
    }
}
