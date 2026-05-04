import SwiftUI

struct PlaceDetailView: View {
    @StateObject private var vm: PlaceDetailViewModel

    init(userPlace: UserPlace) {
        _vm = StateObject(wrappedValue: PlaceDetailViewModel(userPlace: userPlace))
    }

    var body: some View {
        Form {
            Section("Info") {
                LabeledContent("Address", value: vm.userPlace.place.address)
                if let phone = vm.userPlace.place.phone {
                    LabeledContent("Phone", value: phone)
                }
                if let website = vm.userPlace.place.website {
                    LabeledContent("Website", value: website)
                }
            }

            Section("Your Rating") {
                Slider(value: $vm.rating, in: 0...10, step: 0.5) {
                    Text("Rating")
                } minimumValueLabel: {
                    Text("0")
                } maximumValueLabel: {
                    Text("10")
                }
                Text(String(format: "%.1f / 10", vm.rating))
                    .frame(maxWidth: .infinity, alignment: .center)
            }

            Section("Notes") {
                TextField("Add notes…", text: $vm.notes, axis: .vertical)
                    .lineLimit(3...6)
            }

            Button("Save") { Task { await vm.saveRating() } }
                .disabled(vm.isSaving)
        }
        .navigationTitle(vm.userPlace.place.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}
