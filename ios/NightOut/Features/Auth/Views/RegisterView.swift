import SwiftUI

struct RegisterView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) var dismiss
    @StateObject private var vm: AuthViewModel

    init() {
        _vm = StateObject(wrappedValue: AuthViewModel(authManager: AuthManager()))
    }

    var body: some View {
        NavigationStack {
            Form {
                TextField("Display name", text: $vm.displayName)
                TextField("Username", text: $vm.username).autocorrectionDisabled()
                TextField("Email", text: $vm.email).keyboardType(.emailAddress)
                SecureField("Password", text: $vm.password)

                if let error = vm.errorMessage {
                    Text(error).foregroundStyle(.red).font(.caption)
                }
            }
            .navigationTitle("Create Account")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Sign Up") { Task { await vm.register() } }
                        .disabled(vm.isLoading)
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}
