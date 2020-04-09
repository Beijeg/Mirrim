var numArea1 = 0;
var numArea2 = 0;
var numArea3 = 0;
var numTotal = 0;

function calculateNumFragments(){
  numArea1 = 0;
  numArea2 = 0;
  numArea3 = 0;
  numTotal = 0;
  $dataItems.forEach(item => {
    if (item == null) {
    }
    else {
      if (item.note == "Area 1") {
        numArea1 += 1;
        numTotal += 1;
      };
      if (item.note == "Area 2") {
        numArea2 += 1;
        numTotal += 1;
      };
      if (item.note == "Area 3") {
        numArea3 += 1;
        numTotal += 1;
      };
      if (item.note == "Other") {
        numTotal += 1;
      };
    };
  });
};
