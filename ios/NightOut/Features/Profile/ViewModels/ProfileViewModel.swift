import Foundation

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var user: User?

    private let authManager: AuthManager

    init(authManager: AuthManager) {
        self.authManager = authManager
        self.user = authManager.currentUser
    }

    func logout() {
        authManager.logout()
    }
}
