<template>
  <swiper class="swiper md:mb-3" :options="swiperOption">
    <swiper-slide
      v-for="barber in barbers"
      :key="barber._id"
      :style="`background: url(${barber.thumb}) center/cover no-repeat`"
    >
      <NuxtLink :to="`/barbers/${barber._id}`">
        <div class="aspect-w-1 aspect-h-1">
          <div class="flex flex-col justify-end bg-dummy1">
            <div class="bg-black bg-opacity-80 font-thin text-white text-sm py-3 px-5 pb-12">
              <div class="flex items-center">
                <span class="font-bold text-xl">{{ barber.title }}</span>
                <span class="flex items-center text-base ml-auto">
                  <img class="w-5 h-5 mr-1" src="~/assets/img/star.svg" />
                  {{ barber.rating.toFixed(1) }}
                </span>
              </div>
              <div class="flex items-center">
                <img class="w-4 h-4 mr-1" src="~/assets/img/place.svg" />
                {{ barber.location }}
              </div>
            </div>
            <DIsinfectionBadge class="absolute top-2 left-2" :not="!barber.disinfection" />
          </div>
        </div>
      </NuxtLink>
    </swiper-slide>
    <div slot="pagination" class="swiper-pagination"></div>
  </swiper>
</template>

<script>
export default {
  data() {
    return {
      barbers: [],
      swiperOption: {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: false,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          640: {
            slidesPerView: 2,
          },
        },
      },
    };
  },
  async fetch() {
    const { data } = await this.$api.barbers.list();
    this.barbers = data.barbers;
  },
};
</script>

<style></style>
