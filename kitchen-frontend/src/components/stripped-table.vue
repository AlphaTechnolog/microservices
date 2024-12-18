<script setup lang="ts">
interface Props {
    headers: string[];
    values: Record<string, any>[];
    loading?: boolean;
}

const { headers, values, loading = false } = defineProps<Props>();
</script>

<template>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3" v-for="(header, idx) in headers" :key="idx">
                        {{ header }}
                    </th>
                </tr>
            </thead>
            <tbody v-if="loading">
                <slot name="loading">
                    <tr
                        class="odd:bg-white even:bg-gray-50 border-b"
                        v-for="x in Array.from({ length: 3 }, (_, i) => i)"
                        :key="x"
                    >
                        <th
                            scope="row"
                            class="px-4 py-4"
                            v-for="x in Array.from({ length: headers.length }, (_, i) => i)"
                            :key="x"
                        >
                            <div class="w-full animate-pulse bg-gray-200 rounded-full h-2" />
                        </th>
                    </tr>
                </slot>
            </tbody>
            <tbody v-else>
                <tr class="odd:bg-white even:bg-gray-50 border-b" v-for="(value, idx) in values" :key="idx">
                    <slot
                        v-for="(key, keyIndex) in Object.keys(value)"
                        :key="keyIndex"
                        :name="key"
                        :itemKey="key"
                        :itemValue="value[key as keyof typeof value]"
                    >
                        <th scope="row" class="px-4 py-4">
                            {{ value[key] }}
                        </th>
                    </slot>
                </tr>
            </tbody>
        </table>
    </div>
</template>
