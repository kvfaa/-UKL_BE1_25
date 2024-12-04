const midOne = async (request, response, next) => {
    console.log('run Middleware One');
    next();
}
module.exports ={
    midOne
} 