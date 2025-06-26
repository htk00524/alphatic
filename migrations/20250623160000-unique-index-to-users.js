'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('users', ['sns_id', 'provider'], {
      unique: true,
      name: 'users_sns_provider_unique',
      where: {
        sns_id: { [Sequelize.Op.ne]: null},
        provider: { [Sequelize.Op.ne]: null}
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_sns_provider_unique');
  }
};
