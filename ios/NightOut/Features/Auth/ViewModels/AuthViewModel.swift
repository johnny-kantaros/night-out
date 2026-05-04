import Foundation

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var username = ""
    @Published var email = ""
    @Published var password = ""
    @Published var displayName = ""
    @Published var errorMessage: String?
    @Published var isLoading = false

    private let authManager: AuthManager

    init(authManager: AuthManager) {
        self.authManager = authManager
    }

    func login() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            try await authManager.login(username: username, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func register() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            try await authManager.register(
                username: username, email: email, password: password, displayName: displayName
            )
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
