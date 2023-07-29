/*
 * Copyright 2016-present the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineComponent, reactive, ref, unref } from 'vue'
import { FormInstance, FormRules } from 'element-plus'
import { Edit, RefreshLeft, Right, Back } from '@element-plus/icons-vue'

import router from '@/config/router'
import { useRoute } from 'vue-router'

import { getProfileById, updateProfile } from '@/api/profile'

import point from '@/views/point/Point.vue'

export default defineComponent({
    components: { point },
    setup() {
        const route = useRoute()

        // 定义表单引用
        const formDataRef = ref<FormInstance>()

        // 图标
        const Icon = {
            Edit,
            RefreshLeft,
            Right,
            Back,
        }

        // 定义响应式数据
        const reactiveData = reactive({
            id: route.query.id,
            active: +(route.query.active || 0),
            oldProfileFormData: {},
            profileFormData: {} as any,
        })

        // 定义表单校验规则
        const formRule = reactive<FormRules>({
            profileName: [
                {
                    required: true,
                    message: '请输入模板名称',
                    trigger: 'blur',
                },
                {
                    min: 2,
                    max: 32,
                    message: '请输入 2~32 位字长的模板名称',
                    trigger: 'blur',
                },
                {
                    pattern: /^[A-Za-z0-9\u4e00-\u9fa5][A-Za-z0-9\u4e00-\u9fa5-_]*$/,
                    message: '请输入正确格式的模板名称',
                },
            ],
            enableFlag: [
                {
                    required: true,
                    message: '请选择使能',
                    trigger: 'change',
                },
            ],
            remark: [
                {
                    max: 300,
                    message: '最多输入300个字符',
                    trigger: 'blur',
                },
            ],
        })

        const profile = () => {
            const id = route.query.id as string
            getProfileById(id).then((res) => {
                reactiveData.profileFormData = res.data.data
                reactiveData.oldProfileFormData = { ...res.data.data }
            })
        }

        const profileUpdate = () => {
            const form = unref(formDataRef)
            form?.validate((valid) => {
                if (valid) {
                    updateProfile(reactiveData.profileFormData).then((res) => {
                        reactiveData.oldProfileFormData = { ...res.data.data }
                    })
                }
            })
        }

        const pre = () => {
            reactiveData.active--
            changeActive(reactiveData.active)
        }

        const next = () => {
            if (reactiveData.active === 0) {
                profileUpdate()
            }

            reactiveData.active++
            changeActive(reactiveData.active)
        }

        const done = () => {
            router.push({ name: 'profile' }).catch(() => {
                // nothing to do
            })
        }

        const profileReset = () => {
            reactiveData.profileFormData = { ...reactiveData.oldProfileFormData }
        }

        const changeActive = (step) => {
            const query = route.query
            router.push({ query: { ...query, active: step } })
        }

        profile()

        return {
            formDataRef,
            reactiveData,
            formRule,
            pre,
            next,
            done,
            profileReset,
            changeActive,
            ...Icon,
        }
    },
})
