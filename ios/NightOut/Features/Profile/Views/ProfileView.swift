import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        NavigationStack {
            List {
                if let user = authManager.currentUser {
                    Section {
                        LabeledContent("Username", value: user.username)
                        LabeledContent("Display Name", value: user.displayName)
                        LabeledContent("Email", value: user.email)
                    }
                }

                Section {
                    Button("Log Out", role: .destructive) {
                        authManager.logout()
                    }
                }
            }
            .navigationTitle("Profile")
        }
    }
}
