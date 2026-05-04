import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            MapView()
                .tabItem { Label("Map", systemImage: "map") }

            PlaceListView()
                .tabItem { Label("My Places", systemImage: "fork.knife") }

            ProfileView()
                .tabItem { Label("Profile", systemImage: "person") }
        }
    }
}
