let faceMesh;
let bodyPose;
let video;
let faces = [];
let poses = [];
let deviceIDs = [
  "68f51382736fedbb210984efedd896da8c40265d3513d791c052b1f9f3612ab7"
]; // Camera device ID
let options = { maxFaces: 10, refineLandmarks: false, flipHorizontal: true };

function setup() {
  createCanvas(640, 480);
  
  // Create capture for specific device
  let constraints = {
    video: {
      deviceId: deviceIDs[0] // Use specific camera ID
    }
  };
  
  video = createCapture(constraints); // Initialize the video with the constraints
  video.size(640, 480);
  video.hide();
  
  // Initialize face mesh and body pose models
  faceMesh = ml5.faceMesh(options, () => {
    console.log("FaceMesh model loaded");
    faceMesh.detectStart(video, gotFaces);
  });

  bodyPose = ml5.bodyPose({ flipped: true }, () => {
    console.log("BodyPose model loaded");
    bodyPose.detectStart(video, gotPoses);
  });

  frameRate(21);
}

function draw() {
  clear();
  
  // Draw flipped video
   if (video) {
    push(); // Save the current drawing state
    scale(-1, 1); // Flip the canvas horizontally
    image(video, -width, 0, width, height); // Adjust the x-position since the canvas is flipped
    pop(); // Restore the drawing state

    video.loadPixels();

    if (video.pixels.length > 0) {
      pixelatedBody(); // Apply pixelation effect on the video
    }
  }

  // Draw face bounding boxes
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    rect(face.box.xMin, face.box.yMin, face.box.width, face.box.height);
  }

  // Draw body bounding boxes
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    noFill();
    stroke(0, 0, 255);
    strokeWeight(2);
    rect(pose.box.xMin, pose.box.yMin, pose.box.width, pose.box.height);
    fill(0, 0, 255);
    rect(pose.box.xMin, pose.box.yMin - 60, 100, 60);

    textAlign(TOP);
    textSize(40);
    fill(255);
    noStroke();
    text("null", pose.box.xMin, pose.box.yMin - 20);
  }
}

// Pixelated body effect
function pixelatedBody() {
  const stepSize = 6;

  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];

    for (let y = pose.box.yMin; y < pose.box.yMax; y += stepSize) {
      for (let x = pose.box.xMin; x < pose.box.xMax; x += stepSize) {
        let index = floor(x + y * video.width) * 4;
        const r = video.pixels[index + 0];
        const g = video.pixels[index + 1];
        const b = video.pixels[index + 2];

        // Get the brightness of the current pixel by averaging the color values
        const brightness = (r + g + b) / 3;
        const squareSize = map(brightness, 0, 255, 0, stepSize * 2);

        noStroke();
        fill(random(190, 255), g, b, random(225, 255));
        // Draw a rectangle using the color of the current pixel
        rect(x, y, stepSize, stepSize);
      }
    }
  }
}

// Callback for face detection results
function gotFaces(results) {
  faces = results;
}

// Callback for body pose detection results
function gotPoses(results) {
  poses = results;
}

function keyPressed() {
  if (key == " ") {
    console.log(poses);
  }
}
