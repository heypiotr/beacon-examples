Some configuration options of Estimote Beacons are not yet available in the Estimote apps, but are already available in the Estimote SDKs.

Here you will find a few variants of the [Configuration app template](https://cloud.estimote.com/#/apps/add/configuration), pre-defined to configure certain features of Estimote Beacons not yet exposed in the Estimote apps:

- **UART**, if you want to set the GPIO ports of your Location Beacons into the UART mode. You can read more about GPIO & UART in this blog post: [Extending the power of your beacons with GPIO connection](http://blog.estimote.com/post/145508085365/extending-the-power-of-your-beacons-with-gpio)

- **Indoor**, if you want to manually (i.e., bypassing the wizard that is part of the Estimote Indoor Location app) configure your beacons for use with Indoor Location.

Note that the Configuration template in general, and these variants specifically, work only with Location Beacons (hardware revision "F") and next-generation Proximity Beacons (hardware revision "G"). (Although note that some features mentioned above only work with certain models, e.g., GPIO and Indoor require Location Beacons specifically.)
