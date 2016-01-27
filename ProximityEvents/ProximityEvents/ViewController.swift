import UIKit
import CoreLocation

enum Transition { case Entering, Exiting }

class ViewController: UITableViewController, CLLocationManagerDelegate {

    let locationManager = CLLocationManager()

    let messages: [Int: [CLProximity: [Transition: [String]]]] = [
        46191: [
            CLProximity.Immediate: [
                Transition.Entering: [
                    "Entering immediate zone of beacon 46191, msg 1",
                    "Entering immediate zone of beacon 46191, msg 2",
                ],
                Transition.Exiting: [
                    "Exiting immediate zone of beacon 46191, msg 1",
                    "Exiting immediate zone of beacon 46191, msg 2",
                ],
            ],
            CLProximity.Near: [
                Transition.Entering: [
                    "Entering near zone of beacon 46191",
                ],
                Transition.Exiting: [
                    "Exiting near zone of beacon 46191",
                ],
            ],
            CLProximity.Far: [
                Transition.Entering: [
                    "Entering far zone of beacon 46191",
                ],
                Transition.Exiting: [
                    "Exiting far zone of beacon 46191",
                ],
            ],
        ],
        54806: [
            CLProximity.Immediate: [
                Transition.Entering: [
                    "Entering immediate zone of beacon 54806",
                ],
                Transition.Exiting: [
                    "Exiting immediate zone of beacon 54806",
                ],
            ],
            CLProximity.Near: [
                Transition.Entering: [
                    "Entering near zone of beacon 54806",
                ],
                Transition.Exiting: [
                    "Exiting near zone of beacon 54806",
                ],
            ],
            CLProximity.Far: [
                Transition.Entering: [
                    "Entering far zone of beacon 54806",
                ],
                Transition.Exiting: [
                    "Exiting far zone of beacon 54806",
                ],
            ],
        ],
    ]

    var previousZones = [Int: CLProximity]()

    var messagesShown = [String]()

    override func viewDidLoad() {
        super.viewDidLoad()

        locationManager.delegate = self
        locationManager.requestAlwaysAuthorization()

        locationManager.startRangingBeaconsInRegion(CLBeaconRegion(proximityUUID: NSUUID(UUIDString: "B9407F30-F5F8-466E-AFF9-25556B57FE6D")!, identifier: "all beacons"))
    }

    func locationManager(manager: CLLocationManager, didRangeBeacons beacons: [CLBeacon], inRegion region: CLBeaconRegion) {
        for beacon in beacons.filter({ $0.proximity != .Unknown }) {
            let minor = beacon.minor.integerValue

            let currentZone = beacon.proximity
            let previousZone = previousZones[minor]

            if currentZone == previousZone {
                // no change, the user remains in the same proximity zone, process the next beacon
                continue
            }

            // the proximity zone has changed
            // the user has exited the previousZone and entered the currentZone
            if let previousZone = previousZone, exitMessages = messages[minor]?[previousZone]?[.Exiting] {
                messagesShown.appendContentsOf(exitMessages)
            }
            if let enterMessages = messages[minor]?[currentZone]?[.Entering] {
                messagesShown.appendContentsOf(enterMessages)
            }

            previousZones[minor] = currentZone
        }

        tableView.reloadData()
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return messagesShown.count
    }

    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("Basic Cell", forIndexPath: indexPath)
        cell.textLabel?.text = messagesShown[indexPath.row]
        return cell
    }

}
