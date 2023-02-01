from django.contrib.auth.views import LoginView, PasswordChangeView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import *
from django.contrib import messages
from django.shortcuts import redirect
from django.contrib.auth import logout, login
from django.urls.base import reverse_lazy
from .forms import *

def logout_user(request):
    logout(request)
    return redirect('login')

class SignUp(CreateView):
    form_class = SignUpForm
    template_name = 'registration/form.html'

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = 'Регистрация'
        context["button_text"] = "Зарегистрироваться"
        return context

    def form_valid(self, form):
        messages.add_message(self.request, messages.SUCCESS, 'Вы успешно создали аккаунт')
        user = form.save()
        login(self.request, user)
        return redirect('index')

class Login(LoginView):
    form_class = LoginForm
    template_name = 'registration/form.html'

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Вход"
        context["button_text"] = "Войти"
        return context

    def form_valid(self, form):
        messages.add_message(self.request, messages.SUCCESS, f'С возвращением {form.cleaned_data["username"]}!')
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('index')