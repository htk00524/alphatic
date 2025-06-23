//exports.render(html파일명)= (req, res) => {
//  res.render('(html파일명)', { title: '내정보 - NodeBird'});
//};

exports.renderMain = (eq, res, next) => {
  const twits = [];
  res.render('main', {
    title: 'alphaTic',
    twits,
  });
};