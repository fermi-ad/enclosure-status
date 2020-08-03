# Enclosure Status User Documentation

The enclosure status display shows the current status of the operational enclosures.

## Implementation

The status and enclosure name state is held in two Fermi control system devices, `G:ENCSTAT` and `G:ENCNAMES`. These two devices are array enumeration devices. The enumertaion values of `G:ENCNAMES` are all the possible enclosure names. The names are stored in an array device for two reasons. 
First, it allows the operator to arbitrarily reorder the enclosure names based on ascending index. The current display simply reads the indicies in order for the display so changing the order in the array will change the order on the display.
Second, the index serves to relate the names array to the statues array in `G:ENCSTAT`.

The enumeration values of `G:ENCSTAT` are all possible enclosure statuses. The position in the array is related to the position in the `G:ENCNAMES` array. So the display will show the name of the enclosure at index 3 in `G:ENCNAMES` as the status set for index 3 in `G:ENCSTAT`.

## Modification

Changing the status of an enclosure and changing the order of enclosures is trivial. A parameter page allows operators to choose, from a drop-down, the value they'd like to assign to a given index.

If the number of enclosures needs to change then the size of the array device must be changed. BE AWARE: this change appears to erase the state of the device.