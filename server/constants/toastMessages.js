export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Вход выполнен успешно',
    LOGOUT: 'Выход выполнен успешно',
    REGISTER: 'Регистрация успешно завершена',
    DATA_LOADED: 'Данные успешно загружены',
    EMPLOYEE_ADDED: 'Сотрудник успешно добавлен',
    EMPLOYEE_UPDATED: 'Данные сотрудника обновлены',
    EMPLOYEE_DELETED: 'Сотрудник успешно удален',
    PROFILE_UPDATED: 'Профиль успешно обновлен',
    SETTINGS_UPDATED: 'Настройки обновлены',
    CLOCK_IN: 'Рабочий день начат',
    CLOCK_OUT: 'Рабочий день завершен',
    BONUS_ADDED: 'Премия начислена',
    PENALTY_ADDED: 'Штраф назначен',
    QR_GENERATED: 'QR-код сгенерирован'
  },
  ERROR: {
    DEFAULT: 'Произошла ошибка',
    LOGIN: 'Ошибка при входе',
    LOGOUT: 'Ошибка при выходе',
    REGISTER: 'Ошибка при регистрации',
    DATA_LOAD: 'Ошибка при загрузке данных',
    NETWORK: 'Ошибка сети',
    INVALID_QR: 'Недействительный QR-код',
    CLOCK_IN: 'Ошибка при начале рабочего дня',
    CLOCK_OUT: 'Ошибка при завершении рабочего дня',
    VALIDATION: 'Проверьте правильность заполнения полей'
  },
  LOADING: {
    DEFAULT: 'Загрузка...',
    LOGIN: 'Выполняется вход...',
    REGISTER: 'Создание аккаунта...',
    SAVING: 'Сохранение...',
    LOADING_DATA: 'Загрузка данных...',
    CLOCK_IN: 'Начинаем рабочий день...',
    CLOCK_OUT: 'Завершаем рабочий день...'
  }
};

export default TOAST_MESSAGES;