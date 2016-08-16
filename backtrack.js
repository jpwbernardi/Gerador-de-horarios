
function build (choice, table, k, n){
  var flag = [0, 0, 0, 0, 0, 0];
  for(var i = 0; i < k; i++)
    flag[table[i]]++;
  for(var i = 0; i < n; i++)
    if(flag[i] < 2)
      choice.push(i);
}

function backtrack (table, k, n){
  var choice = [];
  if (k == n) {
    console.log(table);
    return;
  }
  build(choice, table, k, n);
  choice.forEach(function(key, value){
    table[k] = value;
    backtrack(table, k + 1, n);
  });
}

function leticia (n){
  var table = [];
  backtrack(table, 0, n);
}
