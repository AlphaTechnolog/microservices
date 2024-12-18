<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <section
            class="w-full h-full rounded-md shadow-md bg-white flex flex-col justify-start items-start"
            v-for="_ in Array.from({ length: 3 })"
        >
            <div class="animate-pulse w-full h-[10rem] bg-slate-300 rounded-t-md" />
            <div class="p-4 w-full space-y-6">
                <div class="w-full bg-slate-300 h-[18px] rounded-full animate-pulse" />
                <div class="space-y-3 w-full animate-pulse">
                    <div class="grid grid-cols-3 gap-4 w-full">
                        <div class="w-full bg-slate-300 h-[12px] col-span-2 rounded-full" />
                        <div class="w-full bg-slate-300 h-[12px] col-span-1 rounded-full" />
                    </div>
                    <div class="w-full bg-slate-300 h-[12px] col-span-2 rounded-full" />
                </div>
                <button
                    class="w-full mt-4 bg-slate-950 text-white rounded-md py-2 transition-all duration-300 hover:bg-slate-800"
                >
                    Buy now
                </button>
            </div>
        </section>
    </div>
</template>
