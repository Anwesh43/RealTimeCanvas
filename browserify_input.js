var angular = require('angular');
var Firebase = require('firebase');
var angularfire = require('angularfire');
var app = angular.module('canvApp',['firebase']);
app.constant('FirebaseUrl','https://resplendent-fire-3956.firebaseio.com/drawCanvShapes');
app.service('dataService',function(FirebaseUrl,$firebaseArray){
    var ref = new Firebase(FirebaseUrl);
    var shapes = $firebaseArray(ref);
    this.getInitialShapes = function() {
      return shapes;
    }
    this.addShape = function(shape) {
      shapes.$add(shape);
    }
})
app.controller('mainController',function($scope,dataService){
    $scope.isDraw = false;
    $scope.currentShape = null;
    $scope.isDown = false;
    $scope.shapes = dataService.getInitialShapes();
    $scope.index = $scope.shapes.length;
    $scope.shapes.$loaded().then(function(){
      $scope.isDraw = true;
    });
    $scope.deg = 0;
});

app.service('drawingService',function(){
    this.clearScreen = function(ctx,width,height){
      ctx.clearRect(0,0,parseInt(width),parseInt(height));
    }
    this.drawShape = function(ctx,shape) {
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'yellowgreen';
      ctx.lineWidth = 4;
      ctx.beginPath();
      shape.points.forEach(function(point,index){
        if(index == 0){
          ctx.moveTo(point.x,point.y);
        }
        else{
          ctx.lineTo(point.x,point.y);
        }
      })
      if(shape.completed) {
          ctx.lineTo(shape.points[0].x,shape.points[0].y);
          ctx.stroke()
          ctx.fill();
      }
      else {
        ctx.stroke();
      }
    }
    this.drawLoader = function(ctx,deg) {
      ctx.strokeStyle = 'yellowgreen';
      ctx.lineWidth = 10;
      ctx.save();
      ctx.translate(200,200);
      ctx.rotate(deg*Math.PI/180);
      ctx.beginPath();
      ctx.moveTo(50,0);
      for(var i=0;i<60;i++) {
        ctx.lineTo(50*Math.cos(i*Math.PI/180),50*Math.sin(i*Math.PI/180))
      }
      ctx.stroke();
      ctx.restore();
    }
});
app.directive('canvDraw',function($interval,drawingService,dataService){

    var dir = {};
    dir.restrict = 'E';
    dir.controller = 'mainController';
    dir.replace = true;
    dir.template = '<canvas style="border:1px solid black;"></canvas>';
    dir.link = function(scope,elem,attr) {

      elem.attr('width',attr.width);
      elem.attr('height',attr.height);
      elem.on('mousedown',function(event){
        if(!scope.isDown && scope.isDraw) {
          var point = {};
          point.x = event.pageX;
          point.y = event.pageY;
          var shape = {};
          shape.points = [];
          shape.points.push(point);
          shape.completed = false;
          scope.currentShape = shape;
          scope.isDown = true;
        }

      });
      elem.on('mousemove',function(event){
          if(scope.isDown) {
            var point = {};
            point.x = event.pageX;
            point.y = event.pageY;
            scope.currentShape.points.push(point);
          }
      });
      elem.on('mouseup',function(event){
          if(scope.isDown) {
            scope.currentShape.completed = true;
            dataService.addShape(scope.currentShape);
            scope.isDown = false;
            scope.index +=1;
            console.log(scope.shapes);

          }
      });
      console.log(elem);
      var ctx = elem[0].getContext('2d');
      $interval(function(){
          drawingService.clearScreen(ctx,attr.width,attr.height);
          scope.shapes.forEach(function(shape){
              drawingService.drawShape(ctx,shape);
          })
          if(scope.currentShape != null)
          drawingService.drawShape(ctx,scope.currentShape);
          if(!scope.isDraw) {
            drawingService.clearScreen(ctx,attr.width,attr.height);
            scope.deg+=10;
            drawingService.drawLoader(ctx,scope.deg);
          }
      },100);
    }
    return dir;
})
