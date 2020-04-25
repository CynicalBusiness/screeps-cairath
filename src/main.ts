export const loop = () => {
    (Game.rooms["E1S3"].memory as any).currentTime = Date.now();
};

console.log("Successfully updated scripts: ", new Date().toISOString());
