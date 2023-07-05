/* global DPM */

const container = document.querySelector('main')
const docBody = document.body
let enclosureStates = []

function colorCode(statName) {
  switch (statName) {
  case 'Undefined':
    return 'undef'
  case 'Controlled':
    return 'cntrl'
  case 'Supervised':
    return 'super'
  case 'Open':
    return 'open'
  case 'No Access':
    return 'noacs'
  }
}

function nameFilter(name) {
  let newName = name
  const REPLACEMENTS = [
    'MINOS Alc',
    'MINOS Abs',
    'Xport US/DS',
    'Xport Mid',
    'Muon Ext'
  ]
  const TO_REPLACE = [
    'MINOS Alcoves',
    'MINOS Absorber',
    'Transport US/DS',
    'Transport Mid',
    'Muon Extraction'
  ]

  const index = TO_REPLACE.indexOf(name)

  if (index > -1) {
    newName = REPLACEMENTS[index]
  }

  return newName
}

function getTimeFromDate(dateString = new Date()) {
  const d = new Date(dateString)
  return d.toString().split(' ')[4]
}

function display(inputArray) {
  container.innerHTML = ''

  for (let object of inputArray) {
    const row = document.createElement('div')
    const enclosure = document.createElement('span')
    const status = document.createElement('span')

    row.className = 'row'
    enclosure.className = 'enclosure'
    status.className = 'status'
    status.className += ' ' + colorCode(object.status.name)

    enclosure.textContent = nameFilter(object.enclosure.name)
    status.textContent = object.status.name

    if (object.enclosure.name === 'App Status:') {
      row.id = 'statusContainer'
      enclosure.id = 'appStatusLabel'
      status.id = 'appStatus'
    }

    row.appendChild(enclosure)
    row.appendChild(status)
    container.appendChild(row)
  }
}

function successState(time) {
  const appStatus = document.querySelector('#appStatus')
  docBody.style.background = 'black'
  appStatus.className = 'super'
  appStatus.textContent = time
}

function handleNewData(dataType) {
  return (reading) => {
    const lastDate = getTimeFromDate()

    if (reading.data.length === enclosureStates.length - 1) { // Minus 1 accounts for app status cell
      reading.data.forEach((enclosureState, enclosureIndex) => {
        if (dataType === 'names') {
          enclosureStates[enclosureIndex].enclosure.name = enclosureState
        } else if (dataType === 'statuses') {
          enclosureStates[enclosureIndex].status.name = enclosureState
        }
      })

      enclosureStates[enclosureStates.length - 1].status.name = lastDate
    } else {
      enclosureStates = []

      reading.data.forEach(enclosureState => enclosureStates.push({
        'status': {
          'name': dataType === 'statuses' ? enclosureState : ''
        },
        'enclosure': {
          'name': dataType === 'names' ? enclosureState : ''
        }
      }))

      enclosureStates.push({
        'status': {
          'name': lastDate
        },
        'enclosure': {
          'name': 'App Status:'
        }
      })
    }

    display(enclosureStates)
    successState(lastDate)
  }
}

function errorState(error) {
  const appStatus = document.querySelector('#appStatus')
  docBody.style.background = 'red'
  appStatus.className = 'noacs'
  appStatus.textContent = 'No response'
  console.error(`ERROR: ${error}`) // eslint-disable-line
}

const dpm = new DPM()

dpm.addRequest('G_ENCNAMES[]@I', handleNewData('names'), errorState)
dpm.addRequest('G_ENCSTAT[]@I', handleNewData('statuses'), errorState)
dpm.addRequest('G_EENCNAMES[]@Q', handleNewData('names'), errorState)
dpm.addRequest('G_ENCSTAT[]@Q', handleNewData('statuses'), errorState)

dpm.start()
