var point_size = 10;

var data_points = null;

var class_colors = null;
var classes = null;
var centers = null;
var prev_centers = null;
var cluster_sizes = [];

var can_classify = false;
var can_move = false;

function generate_data_points(number) {
  data_points = [];
  classes = [];
  for (var i = 0; i < number; i++) {
    data_points.push([random(0, width), random(0, height)]);
    classes.push(-1);
  }
  can_classify = true;
}

function draw_data_points() {
  if (data_points != null) {
    for (var i = 0; i < data_points.length; i++) {
      if (classes[i] < 0) {
        fill(255);
      }
      else {
        fill(class_colors[classes[i]]);
      }
      ellipse(data_points[i][0], data_points[i][1], point_size, point_size);
    }
  }
}

function generate_centers(number) {
  centers = [];
  for (var i = 0; i < number; i++) {
    centers.push([random(0, width), random(0, height)]);
  }
  can_classify = true;
}

function draw_centers() {
  stroke(0);
  if (centers != null) {
    for (var i = 0; i < centers.length; i++) {
      if (can_move || can_classify) {
        strokeWeight(1);
        fill(class_colors[i]);
      }
      else {
        strokeWeight(2);
        stroke(255);
        fill(class_colors[i]);
      }
      rect(centers[i][0], centers[i][1], point_size*1.5, point_size*1.5);
    }
    if (prev_centers != null) {
      for (var i = 0; i < prev_centers.length; i++) {
        //fill(class_colors[i], 0);
        noFill();
        line(prev_centers[i][0], prev_centers[i][1], centers[i][0], centers[i][1]);
        rect(prev_centers[i][0], prev_centers[i][1], point_size*1.5, point_size*1.5);
      }
    }
  }

}

function clear_data() {
  data_points = null;
  classes = null;
  can_classify = false;
  can_move = false;
  update();
}

function new_data() {
  var n_points = document.getElementById('n_data').value;
  generate_data_points(n_points);
  can_classify = true;
  update();
}

function update() {
  background(200);
  if (can_move) {
    document.getElementById("move_btn").disabled = false;
  }
  else {
    document.getElementById("move_btn").disabled = true;
  }
  if (can_classify) {
    document.getElementById("classify_btn").disabled = false;
  }
  else {
    document.getElementById("classify_btn").disabled = true;
  }

  draw_data_points();
  draw_centers();

}

function clear_centers() {
  centers = null;
  prev_centers = null;
  can_move = false;
  can_classify = false;
  update();
}

function classify() {
  prev_centers = null;
  if (data_points != null && centers != null) {
    cluster_sizes = [];
    for (var c = 0; c < centers.length; c++) {
      cluster_sizes.push(0);
    }
    classes = [];
    var closest = null;
    var closest_dist = Infinity;
    for (var i = 0; i < data_points.length; i++) {
      closest_dist = Infinity;
      closest = null;
      for (var c = 0; c < centers.length; c++) {
        var cur_dist = dist(data_points[i][0], data_points[i][1], centers[c][0], centers[c][1]);
        if (cur_dist < closest_dist) {
          closest = c;
          closest_dist = cur_dist;
        }
      }
      classes.push(closest);
      cluster_sizes[closest] = cluster_sizes[closest] + 1;
    }
    can_move = true;
    can_classify = false;
    update();
  }


}

function move_centers() {
  if (data_points != null && centers != null && classes != null) {
    var new_centers = [];
    for (var c = 0; c < centers.length; c++) {
      if (cluster_sizes[c] == 0) {
        new_centers.push(centers[c]);
      }
      else {
        new_centers.push([0, 0]);
      }
    }
    for (var i = 0; i < data_points.length; i++) {
      var cl = classes[i];
      new_centers[cl][0] = new_centers[cl][0] + (data_points[i][0]/cluster_sizes[cl]);
      new_centers[cl][1] = new_centers[cl][1] + (data_points[i][1]/cluster_sizes[cl]);
    }

    can_move = false;
    can_classify = false;
    for (var i = 0; i < centers.length; i++) {
      if (centers[i][0] != new_centers[i][0] || centers[i][1] != new_centers[i][1]) {
        can_classify = true;
        break;
      }
    }
    prev_centers = centers;
    centers = new_centers;
    update();
  }

}

function mousePressed() {
  // Only interested in click on the canvas
  if (mouseX < width && mouseY < height) {
    if (!keyIsPressed) {
      // adds new data point
      if (data_points == null) {
        data_points = [];
      }
      data_points.push([mouseX, mouseY]);
      if (classes == null) {
        classes = [];
      }
      classes.push(-1);
    }
    else {
      // adds new center
      if (centers == null) {
        centers = [];
      }
      centers.push([mouseX, mouseY]);
      if (centers.length > class_colors.length) {
        class_colors.push(color(random(255), random(255), random(255)));
      }
    }
    can_classify = true;
    can_move = false;
    update();
  }
}

function setup() {
  var myCanvas = createCanvas(0.6*windowWidth, 0.7*windowHeight);
  myCanvas.parent('clustering_canvas');
  class_colors = [color(0, 0, 255), color(255, 0, 0), color(0, 255, 0), color(255, 255, 0), color(255, 0, 255), color(0, 255, 255)];
  rectMode(CENTER);
  strokeWeight(2);
  generate_data_points(20);
  generate_centers(3);
  update();
}

