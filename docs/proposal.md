# Enclosure Status

The enclosure status display shows the current status of the operational enclosures.

## Proposal to update the existing enclosure status display

### Need for change

The current system has a common failure mode of the Tomcat getting out of sync with its DAE and not getting new data from the control system. On top of this, the design is intricate, including a database that duplicates the control system state.

Existing display: [https://www-bd.fnal.gov/ops/beau/encstat/](https://www-bd.fnal.gov/ops/beau/encstat/)

### Proposal

The new design should leverage the JavaScript DPM client libraries to simplify the data acquisition pipeline. By having the web display request data directly from the control system, the control system can be the sole source of truth for the system state.

Two devices summarize the state of enclosures. The first is an enumeration device (G:ENCNAMES) that hosts string values for the enclosure names. The raw value of the matching enclosure name will be the index for the second status device. The second device (G:ENCSTAT) is also an enumeration device, but it's an array device. Each index in the array represents an enclosure, but the enumeration values are the enclosure states.

### Testing

Z:ENCSTAT and Z:ENCNAMES will be configured for testing purposes and a web display emulating the existing display, but with the data acquisition updated will be developed.