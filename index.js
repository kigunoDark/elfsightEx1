function run(appElement) {
  const $ = (selector, parent = appElement) => parent.querySelector(selector);
  const $$ = (selector, parent = appElement) =>
    parent.querySelectorAll(selector);

  const formElement = $(".form");
  const formWrapperElement = $(".form__wrapper");
  const formContainerElement = $(".form__container");
  const formInnerElement = $(".form__inner");
  const formStepElements = $$(".form__step");
  const formBannerElement = $(".form__banner");
  const formBannerInner = $(".form__banner-inner");
  const formResetElement = $(".form__reset");
  const formSubmitElement = $(".form__submit");
  const formSubmitLockElement = $(".form__submit-lock");

  let state = {
    ready: false,
    recaptcha: false,
    success: false,
    step: 0,
  };

  function render() {
    appElement.classList.toggle("app--ready", state.ready);

    const formWrapperRect = formWrapperElement.getBoundingClientRect();

    formContainerElement.style.width = `${formWrapperRect.width}px`;
    Array.from(formStepElements).forEach((stepElement) => {
      stepElement.classList.remove("form__step--active");
      stepElement.style.width = `${formWrapperRect.width}px`;
    });

    // Добавляем минус и листается все плавно
    formInnerElement.style.transform = `translate(${
      -formWrapperRect.width * state.step
    }px, 0)`;

    const currentFormStepElement = formStepElements[state.step];

    currentFormStepElement.classList.add("form__step--active");

    /*Высота формы постоянно прыгает, при нажатии кнопок перехода между формами
     В данном случае я бы сделал высоту статичной, не имеет смысл менять её размер, что хорошо видно
     когда мы комментируем строку ниже */

    // const currentFormStepRect = currentFormStepElement.getBoundingClientRect();
    // formInnerElement.style.height = `${currentFormStepRect.height}px`;

    formSubmitElement.classList.toggle(
      "form__submit--unlocked",
      state.recaptcha
    );

    formSubmitLockElement.classList.toggle(
      "form__submit-lock--unlocked",
      state.recaptcha
    );
  }

  function update(change = {}) {
    state = { ...state, ...change };
    render();
  }

  function handleChangeStepElementClick(event) {
    const step = parseInt(event.target.dataset.changeStep, 10);
    update({ step });
  }

  // Меняем статус при проверки на робота
  function handleChangeRecaptchaElementChange(event) {
    // Записал в одну строчку, конечно можно было вынести в переменные но есть ли смысл в данном случае
    window[event.target.dataset.callback](event.target.checked);

    // Можно и таким вариантом записать
    // let callback = target.dataset.callback;
    // let status = event.target.checked;
    // window[callback](status);
  }

  function handleInputInvalid(event) {
    const firstInvalidElement = $(":invalid", formElement);
    firstInvalidElement.focus();

    const step = Array.from(formStepElements).findIndex((formStepElement) => {
      return formStepElement.contains(firstInvalidElement);
    });

    update({ step });
  }

  async function handleFormSubmit(event) {
    /* Решил изменить чуть-чуть этот блок кода, так-как у нас нет api с которым
    мы могли бы тестировать отправку наших данных поэтому тут сразу открываем наш банер 
    в котором говориться что все отлично отправилось, и мы с вами скоро свяжимся */

    // Дата к нам приходит, форма сабмититься
    const data = Object.fromEntries(new FormData(formElement));
    console.log("The following data will be sent:");
    console.log(data);

    // Останавливаем стандартное поведение формы и выводим наушу форму
    event.preventDefault();
    manageModal();
  }

  function handleFormResetClick() {
    update({
      success: false,
      step: 0,
    });

    //Отчищаем таже форму и убираем модальное окно при нажати на кнопку ОК, в самом модальном окне
    formElement.reset();
    manageModal();
  }

  function manageModal() {
    /* Я добавил класс который будет перезапись нужных свойств делать */
    formBannerElement.classList.toggle("show_banner");
    formBannerInner.classList.toggle("show_banner");
  }

  function listen() {
    window.addEventListener("resize", render);

    Array.from($$("[data-change-step]")).forEach((changeStepElement) => {
      changeStepElement.addEventListener("click", handleChangeStepElementClick);
    });

    Array.from($$("input")).forEach((inputElement) => {
      inputElement.addEventListener("invalid", handleInputInvalid);
    });

    // Добавим еще одного слушателя, чтобы сделать нашу страницу болле динамичной
    // Добавить возможность проверки на робота
    $("[data-sitekey]").addEventListener(
      "change",
      handleChangeRecaptchaElementChange
    );

    formElement.addEventListener("submit", handleFormSubmit);
    formResetElement.addEventListener("click", handleFormResetClick);

    window.__handleRecaptchaCallback = (status) =>
      update({ recaptcha: status });
    window.__handleRecaptchaExpireCallback = () => update({ recaptcha: true });
  }

  listen();
  update({ ready: true });
}

run(document.querySelector(".app"));
