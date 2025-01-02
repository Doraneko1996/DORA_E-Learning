<script setup lang="ts">
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { ref } from 'vue';
import ThemeToggle from '@/components/ThemeToggle.vue'

const username = ref('');
const password = ref('');

const handleLogin = () => {
    // Xử lý logic đăng nhập ở đây
    console.log('Login attempt:', username.value, password.value);
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen">
        <div class="fixed top-4 right-4 z-50">
            <ThemeToggle />
        </div>
        <Card class="max-w-[400px] w-full">
            <template #title>
                <h2 class="text-2xl font-semibold text-center">Đăng nhập</h2>
            </template>
            <template #subtitle>
                <p class="text-center text-sm pb-6">Đăng nhập bằng tài khoản GEMS của bạn</p>
            </template>
            <template #content>
                <form @submit.prevent="handleLogin" class="grid gap-4 space-y-2">
                    <div class="grid gap-2">
                        <label for="username">
                            Tên tài khoản
                        </label>
                        <InputText id="username" v-model="username" variant="filled" placeholder="Tên tài khoản của bạn" class="p-2"
                            required />
                    </div>

                    <div class="grid gap-2">
                        <label for="password">
                            Mật khẩu
                        </label>
                        <Password id="password" v-model="password" variant="filled" placeholder="Mật khẩu đăng nhập" :feedback="false"
                            toggleMask class="w-full" required />
                    </div>
                    <Button type="submit" label="Đăng nhập" class="w-full text-white" />

                    <Divider />

                    <div class="w-full text-center">
                        <a href="#" class="hover:underline">
                            Bạn quên mật khẩu?
                        </a>
                    </div>
                </form>
            </template>
        </Card>
    </div>
</template>

<style scoped>
:deep(.p-password input) {
    width: 100%;
}
</style>
