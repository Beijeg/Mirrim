var numArea1 = 0;
var numArea2 = 0;
var numArea3 = 0;
var numTotal = 0;

function calculateNumFragments(){
  $dataItems.forEach(item => {
    if (item == null) {
    }
    else {
      if (item.note == "Area 1") {
        numArea1 += 1;
      };
      if (item.note == "Area 2") {
        numArea2 += 1;
      };
      if (item.note == "Area 3") {
        numArea3 += 1;
      };
      numTotal += 1;
    };
  });
};
