//
// Please report any problems with this app template to contact@estimote.com
//

/* **WHAT TO CUSTOMIZE HERE?** Pretty much everything :smiley:, just like the `BeaconSetupViewController` */

/**
 This struct encapsulates the setup of the beacon that's currently being configured.

 Most of the time, each single option in here will have a UI counterpart in the `BeaconSetupViewController` for the user to set up the configuration.

 Some of these values will be saved to Estimote Cloud and/or your own backend (to be implemented by you :wink:) when actually performing the setup in the `PerformSetupViewController`. This could be, for example, tags.

 Other values will be reflected directly in the beacon's hardware settings. For example, you might want to assign specific major values to specific tags, or bump transmit power of certain beacons based on their location. This mapping is handled by the `beaconSettingsForConfig:` function.

 In other words, this struct is meant to be decoupled from the hardware settings, as it represents the high-level beacon configuration.
 */
struct BeaconConfig {

}

enum Placement: Int {
    case OpenArea, ShortAisle, LongAisle

    var powerLevel: ESTIBeaconPower {
        switch self {
        case .OpenArea:   return .Level2
        case .ShortAisle: return .Level2
        case .LongAisle:  return .Level3
        }
    }
}

let tagsAndMajorsMapping: [String: UInt16] = [
    "store entrance": 100,
    "cash registers": 200,
    "customer service": 300,
    "toys": 1001,
    "electronics": 1002,
    "clothing": 1003,
    "beauty": 1004,
    "groceries": 1005,
]

/**
 This function is meant to return an array of settings to write to the beacon. It takes `BeaconConfig` as its input parameter to allow customizing some hardware settings in response to the beacon configuration. For example, you might want all your beacons to be set to a certain UUID, but vary their major number based on the tag picked by the user.
 */
func beaconSettingsForConfig(config: BeaconConfig) -> [ESTSettingReadWrite] {
    return [
        ESTSettingEstimoteLocationEnable(value: true),
        ESTSettingEstimoteLocationPower(value: .Level8)!,
        ESTSettingEstimoteLocationInterval(value: 200)!
    ]
}
