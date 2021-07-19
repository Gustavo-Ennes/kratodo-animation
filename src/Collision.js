import Ball from "./Ball.js";
export default class Collision{
  
  static MAX_DISTANCE = 0.5

  static ball2Ball(scene){
    let b1, b2, b2Sphere, b1Sphere, max, min, distance

    for(let i = 0; i < Ball.balls.length - 1;i++){

      b1 = Ball.balls[i]
      b1Sphere = b1.getBoundingSphere()

      for(let ii = i + 1; ii < Ball.balls.length; ii++){

        b2 = Ball.balls[ii]
        b2Sphere = b2.getBoundingSphere()

        min  = b2Sphere.radius
        max = min + Collision.MAX_DISTANCE
        distance = b1Sphere.distanceToPoint(b2.mesh.position)
        if(/*distance >= min &&*/distance > 0 && distance <= max && !b1.isDying && !b2.isDying){
          b1.collisionHandler(scene)
          b2.collisionHandler(scene)
        }
      }
    }
  }
  static update(scene){
    Collision.ball2Ball(scene)
  }

}