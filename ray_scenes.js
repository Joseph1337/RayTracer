// routines for creating a ray tracing scene
var pointLights = [];
var spheres = [];
var disks = [];
var shapes = [];
var eyePos;
var fov; 
var u;
var v;
var w;
var backgroundColor;
var ambient_color;
var sampleLevel;
var areaLights = [];
var jitterControl = false;

class PointLight {
  constructor(r, g, b, x, y, z) {
    this.r = r;
    this.g = g;
    this.b = b;
    //this.pos = [x, y, z];
    this.pos = new createVector(x, y, z);
  }
}

class Sphere {
  constructor(x, y, z, radius, dr, dg, db, k_ambient, k_specular, specular_pow) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.origin = new createVector(x, y, z);
    this.radius = radius;
    this.dr = dr;
    this.dg = dg;
    this.db = db;
    this.k_ambient = k_ambient;
    this.k_specular = k_specular;
    this.specular_pow = specular_pow;
    this.shape = "sphere";
  }
}

class Disk {
  constructor(x, y, z, radius, nx, ny, nz, dr, dg, db, k_ambient, k_specular, specular_pow) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = radius;
    this.nx = nx;
    this.ny = ny;
    this.nz = nz;
    this.dr = dr;
    this.dg = dg;
    this.db = db;
    this.k_ambient = k_ambient;
    this.k_specular = k_specular;
    this.specular_pow = specular_pow;
    this.origin = createVector(x, y, z);
    this.shape = "disk";
  }
}

class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

class areaLight {
  constructor(r, g, b, x, y, z, ux, uy, uz, vx, vy, vz) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.x = x;
    this.y = y;
    this.z = z;
    this.ux = ux;
    this.uy = uy;
    this.uz = uz;
    this.vx = vx;
    this.vy = vy;
    this.vz = vz;
    this.u = createVector(ux, uy, uz);
    this.v = createVector(vx, vy, vz);
    this.pos = createVector(x, y, z);
  }
}
// NEW COMMANDS FOR PART B

// create a new disk
function new_disk (x, y, z, radius, nx, ny, nz, dr, dg, db, k_ambient, k_specular, specular_pow) {
  let disk = new Disk(x, y, z, radius, nx, ny, nz, dr, dg, db, k_ambient, k_specular, specular_pow);
  shapes.push(disk);
}

// create a new area light source
function area_light (r, g, b, x, y, z, ux, uy, uz, vx, vy, vz) {
  let alight = new areaLight(r, g, b, x, y, z, ux, uy, uz, vx, vy, vz);
  areaLights.push(alight);
}

function set_sample_level (num) {
  sampleLevel = num;
}

function jitter_on() {
  jitterControl = true;
}

function jitter_off() {
  jitterControl = false;
}


// OLD COMMANDS FROM PART A (some of which you will still need to modify)

function reset_scene() {
  pointLights = [];
  areaLights = [];
  spheres =[];
  disks = [];
  shapes = [];
  //bg_r = 0;
  //bg_g = 0;
  //bg_b = 0;
  fov = 0;
  eyePos = createVector(0, 0, 0);
  ambient_color = new Color(0, 0, 0);
}

// create a new point light source
function new_light (r, g, b, x, y, z) {
  let newLight = new PointLight(r, g, b, x, y, z);
  pointLights.push(newLight);
}

// set value of ambient light source
function ambient_light (r, g, b) {
  //var ambient_r = r;
  //var ambient_g = g;
  //var ambient_b = b;
  ambient_color = new Color(r, g, b);
}

// set the background color for the scene
function set_background (r, g, b) {
  //bg_r = 255 * r;
  //bg_g = 255 * g;
  //bg_b = 255 * b;
  backgroundColor = new Color(r, g, b);
}

// set the field of view
function set_fov (theta) {
  fov = radians(theta);
}

// set the position of the virtual camera/eye
function set_eye_position (x, y, z) {
  //eyePosX = x;
  //eyePosY = y;
  //eyePosZ = z;
  eyePos = createVector(x, y, z);
}

// set the virtual camera's viewing direction
function set_uvw(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
  u = createVector(x1, y1, z1);
  v = createVector(x2, y2, z2);
  w = createVector(x3, y3, z3);
  //console.log(u.mult(1));
}

// create a new sphere
function new_sphere (x, y, z, radius, dr, dg, db, k_ambient, k_specular, specular_pow) {
  let sphere = new Sphere(x, y, z, radius, dr, dg, db, k_ambient, k_specular, specular_pow);
  shapes.push(sphere);
}

// create an eye ray based on the current pixel's position
function eye_ray_uvw (i, j) {
  let uScalar = -1 + ((2*i)/width);
  let vScalar = -1 + ((2*j)/height);


  let rayOrigin = eyePos;
  let d = 1/(tan(fov/2));


  let rayDirection = p5.Vector.add(p5.Vector.mult(w, -1*d), p5.Vector.mult(u, uScalar));
  rayDirection = p5.Vector.add(rayDirection, p5.Vector.mult(v, vScalar));
  //rayDirection.y = rayDirection.y;
  let ray = new Ray(rayOrigin, rayDirection);
  //console.log(rayDirection);
  return ray;
}


function calcT(ray, shapes) {

  if (shapes.shape == "sphere") {
    let a = p5.Vector.dot(ray.direction, ray.direction);
    let b = 2 * (p5.Vector.dot(p5.Vector.sub(ray.origin, shapes.origin), ray.direction)); //2 * ((x-cx)*dx + (y-cy)*dy +
    let c = (p5.Vector.dot(p5.Vector.sub(ray.origin, shapes.origin), p5.Vector.sub(ray.origin, shapes.origin))) - shapes.radius * shapes.radius;
    let d = (b * b) - (4 * a * c);
    if (d >= 0) {
      let t = min((-1 * b + sqrt(d))/(2*a), (-1 * b - sqrt(d))/(2*a));
      if (t > 0) {
        return t;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  } else if (shapes.shape == "disk") {
    let diskNormal = createVector(shapes.nx, shapes.ny, shapes.nz);
    diskNormal.normalize();

    let projVector = p5.Vector.sub(ray.origin, shapes.origin);

    let d = -1 * (p5.Vector.dot(diskNormal, shapes.origin));

    if (p5.Vector.dot(diskNormal, ray.direction) == 0) {
      return 0;
    }
    let t = -1 * ((p5.Vector.dot(diskNormal, ray.origin) + d)/(p5.Vector.dot(diskNormal, ray.direction)));
    let intersect = p5.Vector.add(ray.origin, p5.Vector.mult(ray.direction, t));
    let distBetween = p5.Vector.dist(intersect, shapes.origin);
    if (t > 0) {
      if (distBetween <= shapes.radius) {
        return t;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
}

function findMinT(ray) {
  let minT = 9999999;
  let closest;
  for (let i=0; i<shapes.length; i++) {
    let t = calcT(ray, shapes[i]);
    if (t!=0) {
      hits += 1;
      if (t < minT) {
        minT = t;
        closest = shapes[i];
      }
    }
  }
  return minT;
}


// this is the main routine for drawing your ray traced scene
function draw_scene() {
  noStroke();  // so we don't get a border when we draw a tiny rectangle
  // go through all the pixels in the image

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      //let r, g, b;  // placeholders to store the pixel's color
      let r = 0;  // placeholders to store the pixel's color
      let g = 0;
      let b = 0;
      var hits;
      for (let subY = 0; subY < sampleLevel; subY++) {
        for (let subX = 0; subX < sampleLevel; subX++) {
          let sx = x + ((subX + 1) / (sampleLevel + 1)) - 0.5;
          let sy = y + ((subY + 1) / (sampleLevel + 1)) - 0.5;

          var ray = eye_ray_uvw (sx, sy);

          let closest;
          let minT = 9999;
          hits= 0;
          //finds the closest T
          for (let i=0; i < shapes.length; i++) {
            let t = calcT(ray, shapes[i]);
            if (t < minT && t != 0) {
              closest = shapes[i];
              minT = t;
              hits += 1;
            }
          }

          if (hits != 0) {
            //r = 0;
            //g = 0;
            //b = 0;
            var shapeIntersect = closest;
            var originIntersect = p5.Vector.add(ray.origin, p5.Vector.mult(ray.direction, minT));
            var surfaceNormal;

            //calc surface normal for either sphere or disk
            if (closest.shape == "sphere") {
              surfaceNormal = p5.Vector.sub(originIntersect, shapeIntersect.origin).normalize();
            } else if (closest.shape == "disk") {
              surfaceNormal = createVector(shapeIntersect.nx, shapeIntersect.ny, shapeIntersect.nz);
            }
            r += ambient_color.r * shapeIntersect.k_ambient * shapeIntersect.dr;
            g += ambient_color.g * shapeIntersect.k_ambient * shapeIntersect.dg;
            b += ambient_color.b * shapeIntersect.k_ambient * shapeIntersect.db;

            //========================POINT LIGHTS==================
            //iterate through all point lights
            for (let j = 0; j < pointLights.length; j++) {                        
              let lightVector = (p5.Vector.sub(pointLights[j].pos, originIntersect));
              let offsetVector = (p5.Vector.mult(surfaceNormal, 0.001));
              let shadowDirection = (p5.Vector.sub(pointLights[j].pos, originIntersect));
              let shadowOrigin = p5.Vector.add(originIntersect, offsetVector);
              let shadowRay = new Ray(shadowOrigin, lightVector);
              
              let minShadowT = 9999;
              let shadowHits = 0;
              let shadowT;
              //find minShadowT
              for (let k = 0; k < shapes.length; k++) { //iterate through all objects in scene
                shadowT = calcT(shadowRay, shapes[k]); //find shadow intersection
                if (shadowT != 0) {
                  shadowHits +=1;
                  if (shadowT < minShadowT) {
                    minShadowT = shadowT;
                  }
                }
              }

              if (minShadowT > 0 && minShadowT < 1) {
                r += 0;
                g += 0;
                b += 0;
              } else {
                r += shapeIntersect.dr * pointLights[j].r * max(0, surfaceNormal.dot(lightVector.normalize()));
                g += shapeIntersect.dg * pointLights[j].g * max(0, surfaceNormal.dot(lightVector.normalize()));
                b += shapeIntersect.db * pointLights[j].b * max(0, surfaceNormal.dot(lightVector.normalize()));
              }
            } //end of iterating through pointLights

           let jr = 0;
            if(jitterControl == true){
               jr = Math.random() - 0.5;
            }
            //============AREA LIGHTS===================
            //iterate through area lights
            for (let j = 0; j < areaLights.length; j++) {                        
              let U = areaLights[j].u;
              let V = areaLights[j].v;
             
              let Ls = ((subX+1+jr) / (sampleLevel+1)) * 2 - 1;
              let Lt = ((subY+1+jr) / (sampleLevel+1)) * 2 - 1;
              let su = p5.Vector.mult(U, Ls);
              let tv = p5.Vector.mult(V, Lt);
              
              //let formula = p5.Vector.add(areaLights[j].pos, su);
              let equation = p5.Vector.add(p5.Vector.add(areaLights[j].pos, su), tv); //p = c + su + tv

              let lightVector = p5.Vector.sub(equation, originIntersect);

              let offsetVector = (p5.Vector.mult(surfaceNormal, 0.0001));
      
              let shadowOrigin = p5.Vector.add(originIntersect, offsetVector);
              let shadowRay = new Ray(shadowOrigin, lightVector);
              
              let minShadowT = 9999;
              let shadowHits = 0;
              let shadowT;
              //find minShadowT
              for (let k = 0; k < shapes.length; k++) { //iterate through all objects in scene
                shadowT = calcT(shadowRay, shapes[k]); //find shadow intersection
                if (shadowT != 0) {
                  shadowHits +=1;
                  if (shadowT < minShadowT) {
                    minShadowT = shadowT;
                  }
                }
              }

              if (minShadowT > 0 && minShadowT < 1) {
                r += 0;
                g += 0;
                b += 0;
              } else {
                r += shapeIntersect.dr * areaLights[j].r * max(0, surfaceNormal.dot(lightVector.normalize()));
                g += shapeIntersect.dg * areaLights[j].g * max(0, surfaceNormal.dot(lightVector.normalize()));
                b += shapeIntersect.db * areaLights[j].b * max(0, surfaceNormal.dot(lightVector.normalize()));
              }
            }
           
          } else {
            r += backgroundColor.r;
            g += backgroundColor.g;
            b += backgroundColor.b;
          }
        }
      }
      // set the pixel color, converting values from [0,1] into [0,255]
      r = r / (sampleLevel * sampleLevel);
      g = g / (sampleLevel * sampleLevel);
      b = b / (sampleLevel * sampleLevel);

      fill (255 * r, 255 * g, 255 * b);
      rect (x, height - y, 1, 1);   // make a little rectangle to fill in the pixel
    }
  }
}
