import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var vm: AuthViewModel
    @State private var showRegister = false

    init() {
        // ViewModel created lazily with authManager injected via onAppear
        _vm = StateObject(wrappedValue: AuthViewModel(authManager: AuthManager()))
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("Night Out")
                    .font(.largeTitle.bold())

                TextField("Username", text: $vm.username)
                    .textContentType(.username)
                    .autocorrectionDisabled()
                    .textFieldStyle(.roundedBorder)

                SecureField("Password", text: $vm.password)
                    .textContentType(.password)
                    .textFieldStyle(.roundedBorder)

                if let error = vm.errorMessage {
                    Text(error).foregroundStyle(.red).font(.caption)
                }

                Button("Log In") {
                    Task { await vm.login() }
                }
                .buttonStyle(.borderedProminent)
                .disabled(vm.isLoading)

                Button("Create account") { showRegister = true }
                    .font(.footnote)
            }
            .padding()
            .sheet(isPresented: $showRegister) {
                RegisterView()
            }
        }
    }
}
