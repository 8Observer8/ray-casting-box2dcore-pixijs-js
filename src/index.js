import { b2BodyType, b2PolygonShape, b2Vec2, b2World, DrawShapes } from "@box2d/core";
import * as PIXI from "pixi.js";
import DebugDrawer from "./debug-drawer.js";

async function init() {
    const renderer = PIXI.autoDetectRenderer(300, 300, {
        backgroundColor: 0x000000,
        antialias: true,
        resolution: 1
    });
    renderer.view.width = 300;
    renderer.view.height = 300;
    document.body.appendChild(renderer.view);

    const stage = new PIXI.Container();

    const world = b2World.Create({ x: 0, y: 9.8 });
    const pixelsPerMeter = 30;
    const debugDrawer = new DebugDrawer(stage, pixelsPerMeter);

    // Box
    const boxShape = new b2PolygonShape();
    boxShape.SetAsBox(20 / pixelsPerMeter, 20 / pixelsPerMeter);
    const boxBody = world.CreateBody({
        type: b2BodyType.b2_dynamicBody,
        position: { x: 100 / pixelsPerMeter, y: 30 / pixelsPerMeter },
        angle: 0
    });
    const boxFixture = boxBody.CreateFixture({ shape: boxShape, density: 1 });
    boxBody.SetFixedRotation(true);

    // Ground
    const groundShape = new b2PolygonShape();
    groundShape.SetAsBox(130 / pixelsPerMeter, 20 / pixelsPerMeter);
    const groundBody = world.CreateBody({
        type: b2BodyType.b2_staticBody,
        position: { x: 150 / pixelsPerMeter, y: 270 / pixelsPerMeter }
    });
    groundBody.CreateFixture({ shape: groundShape });

    // Platform
    const platformShape = new b2PolygonShape();
    platformShape.SetAsBox(20 / pixelsPerMeter, 20 / pixelsPerMeter);
    const platformBody = world.CreateBody({
        type: b2BodyType.b2_staticBody,
        position: { x: 150 / pixelsPerMeter, y: 170 / pixelsPerMeter }
    });
    platformBody.CreateFixture({ shape: platformShape });

    const lines = new PIXI.Graphics();
    stage.addChild(lines);
    const color = new PIXI.Color([1, 0.2, 0.2]).toHex();
    lines.lineStyle(1, color, 1, 0.5, true);
    lines.moveTo(150, 170);
    lines.lineTo(100, 170);

    let currentTime, lastTime, dt;

    function render() {
        requestAnimationFrame(render);

        currentTime = Date.now();
        dt = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        world.Step(dt, { velocityIterations: 3, positionIterations: 2 });
        DrawShapes(debugDrawer, world);

        const point1 = new b2Vec2(150 / pixelsPerMeter, 170 / pixelsPerMeter);
        const point2 = new b2Vec2(100 / pixelsPerMeter, 170 / pixelsPerMeter);

        const input = {
            p1: point1,
            p2: point2,
            maxFraction: 1
        };

        const output = {
            normal: new b2Vec2(0, 0),
            fraction: 1
        };

        const ok = boxFixture.RayCast(output, input);
        if (ok) {
            console.log("detected");
        }

        // Render the stage
        renderer.render(stage);
        debugDrawer.clear();
    }

    lastTime = Date.now();
    render();
}

init();
