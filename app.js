var Enumerable = require('linq');

function facilitator(g){
  var p = g.next();
  if(p.done){ return };
  p.value.then(()=>facilitator(g));
}

// yeildでawait
function* Main(){

  var board = {
    pieces: [
      ['-', '-', '-'],
      ['-', '-', '-'],
      ['-', '-', '-']
    ],
    mark: {
      cp: '×',
      user: '〇'
    },
    display: function(){
      var p = this.pieces;
      console.log(' \t0\t1\t2');
      console.log('0\t'+p[0][0]+'\t'+p[0][1]+'\t'+p[0][2]);
      console.log('1\t'+p[1][0]+'\t'+p[1][1]+'\t'+p[1][2]);
      console.log('2\t'+p[2][0]+'\t'+p[2][1]+'\t'+p[2][2]);
    },
    putmark: function(place, turnof){
      this.pieces[place[0]][place[1]] = this.mark[turnof];
    },
    checkwinner: function(){
      var checklines = [
        [[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]]
      ];
      return Enumerable.from(Object.keys(this.mark))
        .select(key=>Enumerable.from(checklines)
          .select(line=>Enumerable.from(line)
            .where(p=>this.pieces[p[0]][p[1]]==this.mark[key])
            .count())
          .max())
        .select((score, i)=>score==3?(i==0?'cp':'user'):false)
        .where(winner=>winner!=false)
        .toArray()
        .join('')
    },
    countremain: function(){
      return Enumerable.from(this.pieces)
        .selectMany(es=>es.filter(e=>e=='-'))
        .count();
    }
  }

  var inputof = {
    cp: function(b){
      return new Promise((resolve, reject)=>{
        var input = '';
        input = [parseInt(3*Math.random()), parseInt(3*Math.random())];
        resolve(input);
      });
    },
    user: function(){
      return new Promise((resolve, reject)=>{
        console.log('手を入力してください.　例)2 0');
        process.stdin.on('data', data=>{
          var input = data.toString().replace(/\r?\n/g,"").split(' ');
          resolve(input);
        });
      });
    }
  }

  var cointoss = function(){
    return Boolean(parseInt(Math.random()*2))?'cp':'user';
  };


  var turnof = cointoss();
  if(turnof=='cp'){
    console.log('CPが先攻です');
  }else if(turnof=='user'){
    console.log('あなたが先攻です');
  }

  board.display();

  var winner = '';
  var remain = Infinity;
  while(winner == '' && remain>0){
    var input;
    do{
      yield inputof[turnof](board.pieces).then(i=>input=i);
    }while(input.length!=2||board.pieces[input[0]][input[1]] != '-');
    board.putmark(input, turnof);
    board.display();
    var winner = board.checkwinner();
    turnof = turnof=='cp'?'user':'cp';
    remain = board.countremain();
  }

  if(winner=='cp'){
    console.log('CPの勝ちです');
  }else if(winner=='user'){
    console.log('あなたの勝ちです');
  }else{
    console.log('引き分けです');
  }

}

facilitator(Main());
