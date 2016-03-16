[![travis build](https://img.shields.io/travis/odry1190/Freetime.svg)](https://travis-ci.org/odry1190/Freetime)
[![codecov coverage](https://img.shields.io/codecov/c/github/odry1190/Freetime.svg)](https://codecov.io/github/odry1190/freetime)
[![version](https://img.shields.io/npm/v/freetime.svg?style=flat-square)](http://npmjs.com/package/freetime)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)

## Installation

This package is distributed via npm:

```
npm install freetime
```
## Usage

```javascript
var Freetime = require('Freetime');

/*
  Initialize with javascript Date object.
*/
var t1 = Freetime({
  only_office_schedule : true,
  office_schedule_start : new Date(2016, 5, 11, 8, 0, 0, 0),
  office_schedule_end : new Date(2016, 5, 11, 17, 0, 0, 0)
});

/*
  Initialize with a string. The format must be 'HH:mm:ss'.
*/
var t2 = Freetime({
  office_schedule_start : '09:00:00',
  office_schedule_end : '15:00:00'
});

/*
  Initialize with a momentjs object.
*/
var t3 = Freetime({
  office_schedule_start : moment({ hour : 10, minute : 0, second : 0}),
  office_schedule_end : moment({ hour : 14, minute : 0, second : 0})
});

///////////////////////////////

var tasks1 = [
  { start : '08:00:00', end : '10:00:00' }
];
var free1 = t1.calculate_freetime(tasks1);
/*
'free1' will contain:

[
  {start : '10:00:00', end : '17:00:00'}
]

Where 'start' and 'end' are momentjs objects
*/

console.log(free1[0].start.format('HH:mm:ss'));
//10:00:00

///////////////////////////////

var tasks2 = [
  { start : '09:00:00', end : '10:00:00' },
  { start : '11:00:00', end : '12:00:00' },
  { start : '13:00:00' } // Since end is not present, it is assumed that the tasks last the whole day
];

var free2 = t2.calculate_freetime(tasks2);
/*
'free2' will contain:

[
  {start : '10:00:00', end : '11:00:00'},
  {start : '12:00:00', end : '13:00:00'}
]

Where 'start' and 'end' are momentjs objects in each case.
*/


```

## Parameters

* **'only_office_schedule'** (Default true): Defines if the freetime will be taken from an interval of specific hours or the whole day.

* **'office_schedule_start'**: (Default 08:00:00) Defines the start of an office day. Only valid if 'only_office_schedule' is true.

* **'office_schedule_end'** (Default 17:00:00): Defines the end of an office day. Only valid if 'only_office_schedule' is true.
