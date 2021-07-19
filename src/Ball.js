import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';

const loader = new THREE.TextureLoader()

class Ball{

  static balls = []
  static idCounter = 0
  static MAXBALLS = 30
  static ballsDying = 0
  static model = null
  static textures = []  


  constructor(){
    let g, m

    // threejs specifics
    g = new THREE.SphereGeometry(1, 10, 10)
    m = new THREE.MeshPhongMaterial({color: Ball.randomColor()})
    this.mesh = new THREE.Mesh(g, m)
    // this.mesh = Ball.model
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.mesh.position.copy(Ball.randomPos())
    this.id = ++Ball.idCounter
    this.mesh.name = this.id
    this.mesh.ball = this
    // meta
    this.isTweenning = false
    this.life = 10 + Math.random() * 10
    this.tweenQtd = 0
    this.isBaby = true
    this.fatFactor = 0.01 + Math.random() * 0.08
    this.pregnancyDuration = 5 + Math.random() * 10
    this.pregnancyCounter = 0
    this.tween = null
    this.boundingSphereRadius = 1
    this.isDying = false
    this.mesh.geometry.computeBoundingSphere()
    
    // this.toString()
  }

  static tweenDuration(){
    return 500 + Math.random() * 1000
  }

  // random position between -80 e 80
  static randomPos(){
    return new THREE.Vector3(
      Math.random() * 160 - 80,
      Math.random() * 160 - 80,
      Math.random() * 160 - 80,
      
    )
  }
  // red value represents how close to death is the ball
  // while g and b values are fixed between 0.4 and 1, red are affected by life
  static randomColor(){
    return new THREE.Color(
      0.4  * ( this.life * .05 ) *.4,
      0.4 + Math.random() * .4,
    .4 + (.25 + this.pregnancyCounter * .05) * .4
    )
  }

  static born(ball, scene, mother=null){
    const pos = mother ? mother.mesh.position : new THREE.Vector3(
      60 - Math.random() * 180,
      60 - Math.random() * 180,
      60 - Math.random() * 180
    )
    scene.add(ball.mesh)
    Ball.balls.push(ball)
    ball.mesh.position.copy(pos)

  }

  static die(ball, scene){
    scene.remove(ball.mesh)
    Ball.balls = Ball.balls.filter(b => b.id !== ball.id)    
    ball.mesh.material.dispose()
    ball.mesh.geometry.dispose()

  }

  static update(scene){
    Ball.balls.forEach(ball => {ball.updateRoutine(scene)})
  }  


  updateRoutine(scene){
    this.tweenRoutine(scene)
  }

  collisionHandler(scene){
    if(!this.isBaby && !this.isDying){  

      this.isDying = true

      const scaleFactor = 1 + Math.random() * 5
      const newScale = new THREE.Vector3(
        scaleFactor,
        scaleFactor,
        scaleFactor,
      )  

      new TWEEN.Tween(this.mesh.scale)
      .to(newScale, 100)
      .easing(TWEEN.Easing.Exponential.Out)
      .onStart(() => {
        Ball.ballsDying++
      })
      .onComplete(() => {
        new TWEEN.Tween(this.mesh.scale)
        .to(new THREE.Vector3(), 50)
        .onComplete(() => {

          Ball.die(this, scene)
          Ball.ballsDying--

        })
        .start()
      })
      .start()
    }
  }

  getBoundingSphere(){
    this.updateBoundingSphere()
    return this.mesh.geometry.boundingSphere
  }


  updateBoundingSphere(){
    this.boundingSphereRadius = 1 + (this.fatFactor * this.tweenQtd)
    this.mesh.geometry.computeBoundingSphere()
    this.mesh.geometry.boundingSphere.radius = this.boundingSphereRadius

  }

  fatRoutine(){
    const fat = {
      x: 1 + (this.fatFactor * this.tweenQtd),
      y: 1 + (this.fatFactor * this.tweenQtd),
      z: 1 + (this.fatFactor * this.tweenQtd)
    }
    new TWEEN.Tween(this.mesh.scale)
    .to(fat, 150)
    .onComplete(()=>{this.updateBoundingSphere()})
    .easing(TWEEN.Easing.Exponential.Out)
    .start()
  }

  bornRoutine(scene, time){
    if(!this.isBaby && Ball.balls.length < Ball.MAXBALLS && !this.isDying){
      
      if(this.pregnancyCounter > this.pregnancyDuration){
        this.pregnancyCounter = 0

        const newScale = {
          x:[1 + Math.random(), 1],
          y:[1 + Math.random(), 1],
          z:[1 + Math.random(), 1]
        }

        new TWEEN.Tween(this.mesh.scale)
        .to(newScale,time)
        .easing(TWEEN.Easing.Quintic.InOut)
        .onStart(()=>{
          for(let i = 0; i < Math.random() * 4; i++){
            Ball.born(new Ball(), scene, this)
          }
        })
        .start()
      }
    }
  }

  tweenRoutine(scene){

    if(!this.isDying && !this.isTweenning){

      let clock
      const time = Ball.tweenDuration()
      // one ball is a baby for only 400 milisseconds
      const tweenUpdateRoutine = () => {
        if(this.isBaby){      
          if(clock.getElapsedTime() > 0.4){
            this.isBaby = false
          }
        }
        this.mesh.rotation.y -= 0.02

        this.colorRoutine(time)
      }
      const tweenStartRoutine = () => {
        this.isTweenning = true
        clock = new THREE.Clock()
      }
      const tweenCompleteRoutine = () => {
        this.isTweenning = false
        this.tweenQtd++
        this.pregnancyCounter++
        this.life -= 1
        this.fatRoutine()
        this.bornRoutine(scene, time)

        if(this.life < 1){
          this.collisionHandler(scene)
        }
      }
      this.tweenTarget = Ball.randomPos()

      this.tween = new TWEEN.Tween(this.mesh.position)
      .to(this.tweenTarget, time)
      .easing(TWEEN.Easing.Exponential.InOut)
      .onUpdate(() => {tweenUpdateRoutine()})
      .onStart(() => {tweenStartRoutine()})
      .onComplete(() => {tweenCompleteRoutine()})
      .start()
    }
  }

  colorRoutine(time){
    const newColor = Ball.randomColor()

    new TWEEN.Tween(this.mesh.material.color)
    .to(newColor, time)
    .easing(TWEEN.Easing.Cubic.In)
    .start()
  }



  toString(){
    console.log(`
    =====================================
    > #${this.id}
      -- is tweening: ${this.isTweenning}
      -- life: ${this.life}
      -- tween qtd: ${this.tweenQtd}
      -- is baby: ${this.isBaby}
      -- fat factor: ${this.fatFactor}
      -- pregnancy: ${this.pregnancyDuration}
      -- pregnancy counter: ${this.pregnancyCounter}
      =====================================
    `)
  }
}


export default Ball