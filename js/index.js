/**
 * @fileoverview Display current status of Fermi Enclosures from OAC
 * @author beau@fnal.gov (Beau Harrison)
 */

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

function getTimeFromDate(dateString) {
  const d = new Date(dateString)
  return d.toString().split(' ')[4]
}

function appendAppStatus(inputArray, time) {
  const resultArray = inputArray
  resultArray.push({
    'status': {
      'name': time
    },
    'enclosure': {
      'name': 'App Status:'
    },
  })
  return resultArray
}

function display(inputArray) {
  const container = document.querySelector('main')

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
  document.body.style.background = 'black'
  document.querySelector('#appStatus').className = 'super'
  document.querySelector('#appStatus').textContent = time
}

function build(response) {
  return (json) => {
    const lastDate = getTimeFromDate(response.headers.get('date'))
    document.querySelector('main').innerHTML = ''
    display(appendAppStatus(json, lastDate))
    successState(lastDate)
  }
}

function errorState(error) {
  document.body.style.background = 'red'
  document.querySelector('#appStatus').className = 'noacs'
  document.querySelector('#appStatus').textContent = 'No response'
  console.error(`ERROR: ${error}`)
}

function getEnclosureStatus() {
  if (!self.fetch) {
    alert('This browser does not support fetch.')
    return
  }

  // const uri = 'https://localhost:3000/getCurrentEntries'
  const uri = 'https://www-bd.fnal.gov/EnclosureStatus/getCurrentEntries'
  fetch(`${uri}?${new Date().getTime()}`) // Date argument for cache busting
    .then((response) => {
      if (!response.ok) {
        errorState('Response not OK')
        return
      } else {
        response.json().then(build(response))
      }
    })
    .catch((error) => errorState(error))
}

// Self executing function as initializer
(function () {
  getEnclosureStatus()
  setInterval('getEnclosureStatus()', 10000)
})()