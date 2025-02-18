<template>
  <main>
    <template v-if="barber">
      <!-- title section -->
      <div class="barbershop-heading relative flex flex-col justify-center items-center font-bold">
        {{ barber.title }}
        <DIsinfectionBadge class="mt-1" :not="!barber.disinfection" />
      </div>
      <!-- page contents -->
      <div class="container pt-3 px-4">
        <!-- reservation section -->
        <div class="mb-6">
          <!-- section heading -->
          <CommonHeading class="mb-2">RESERVATION</CommonHeading>
          <!-- calender (지금은 그냥 input으로 대체) -->
          <!-- time selector -->
          <div class="flex flex-col items-center mb-2">
            <div class="mb-2">
              <!-- <DatePicker v-model="date" :disabled-dates="disabledDates" /> -->
              <DatePicker v-model="date" :minute-increment="10" mode="dateTime" is24hr is-required />
            </div>
          </div>
          <!-- additional message input -->
          <div class="mb-2">
            <ValidationObserver ref="description" class="block w-full">
              <ValidationProvider
                v-slot="{ errors, classes }"
                class="flex justify-center w-full"
                name="용무"
                rules="max:140"
              >
                <div class="w-full max-w-md">
                  <div class="font-bold text-left mb-1">
                    사장님께 용무
                    <span class="text-gray-500 text-sm font-light ml-3">{{ description.length }}/140</span>
                  </div>
                  <textarea
                    v-model="description"
                    class="rounded border py-1 px-2 w-full max-w-md focus:outline-none focus:border-brand"
                    rows="5"
                  ></textarea>
                  <transition name="fade">
                    <div
                      v-if="errors.length > 0"
                      class="max-w-md text-left text-xs md:text-sm text-red-400"
                      :class="classes"
                    >
                      {{ errors[0] }}
                    </div>
                  </transition>
                </div>
              </ValidationProvider>
            </ValidationObserver>
          </div>
          <!-- submit button -->
          <div class="flex justify-end">
            <button class="rounded bg-brand text-white py-2 px-4" @click="book">에약하기</button>
          </div>
        </div>
        <!-- reviews section -->
        <div class="mb-6">
          <CommonHeading class="mb-2">REVIEWS</CommonHeading>
          <template v-if="reviews.length === 0">
            <div class="text-sm text-center md:text-base">아직 리뷰가 없습니다!</div>
          </template>
          <ReviewListItem
            v-for="review in reviews"
            :key="review._id"
            :review="review"
            class="rounded border bg-white mb-2"
          />
        </div>
        <!-- info section -->
        <div class="mb-6">
          <CommonHeading class="mb-2">INFO</CommonHeading>
          <div class="flex flex-col md:flex-row">
            <div class="mb-4 md:w-1/2 md:pr-1">
              <div class="font-bold ml-4 mb-1 md:hidden">위치</div>
              <div ref="map" class="w-full kakao-map"></div>
            </div>
            <div class="p-4 md:py-6 md:px-4">
              <div class="font-bold mb-2 md:text-xl">영업정보</div>
              <div class="mb-8">
                <div class="mb-2">
                  <div class="mb-2 md:text-lg">평일</div>
                  <div class="flex items-center">
                    <span class="flex items-center mr-8">
                      <img class="mr-2 w-7" src="@/assets/img/clock.svg" />
                      {{ weekdayDuration }}
                    </span>
                    <span class="items-center hidden md:flex">
                      <img class="mr-2 w-7" src="@/assets/img/phone.svg" />
                      {{ barber.phone }}
                    </span>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="mb-2 md:text-lg">주말</div>
                  <span class="flex items-center mr-8">
                    <img class="mr-2 w-7" src="@/assets/img/clock.svg" />
                    {{ weekendDuration }}
                  </span>
                </div>
              </div>
              <div class="" v-html="descriptionWithTag"></div>
              <span class="flex items-center mt-3 md:hidden">
                <img class="mr-2 w-7" src="@/assets/img/phone.svg" />
                {{ barber.phone }}
              </span>
              <!-- <div class="rounded border w-full bg-gray-50 text-center py-3 px-6">구현 준비중</div> -->
            </div>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<script>
import moment from 'moment';
// import Calendar from 'v-calendar/lib/components/calendar.umd';
import DatePicker from 'v-calendar/lib/components/date-picker.umd';

export default {
  components: {
    // Calendar,
    DatePicker,
  },
  middleware: 'auth',
  data() {
    return {
      barber: null,
      reservations: null,
      reviews: [],
      date: moment().add(1, 'd').set('h', 18).set('m', 0).toString(),
      description: '',
      map: null,
    };
  },
  computed: {
    descriptionWithTag() {
      return this.barber.description.replace(/(\n|\r\n)/g, '<br />');
    },
    weekdayDuration() {
      const start = moment()
        .set('hour', this.barber.weekday.start.hour)
        .set('minute', this.barber.weekday.start.minute);
      const end = moment().set('hour', this.barber.weekday.end.hour).set('minute', this.barber.weekday.end.minute);

      console.log(start.toISOString(), end.toISOString());
      return `${start.format('HH:mm')} ~ ${end.format('HH:mm')}`;
    },
    weekendDuration() {
      const start = moment()
        .set('hour', this.barber.weekend.start.hour)
        .set('minute', this.barber.weekend.start.minute);
      const end = moment().set('hour', this.barber.weekend.end.hour).set('minute', this.barber.weekend.end.minute);
      return `${start.format('HH:mm')} ~ ${end.format('HH:mm')}`;
    },
  },
  async fetch() {
    const id = this.$route.params.id;
    const { data: barber } = await this.$api.barbers.show(id);
    this.barber = barber;

    const { data: reviewResponse } = await this.$api.barbers.reviews(id);
    this.reviews = reviewResponse.reviews;

    const m = moment(this.date);
    const { data: reservationsResponse } = await this.$api.barbers.reservations(
      this.barber._id,
      m.year(),
      m.month() + 1
    );
    this.reservations = reservationsResponse.reservations;
  },
  watch: {
    barber(val) {
      this.$nextTick(() => {
        this.drawMap(val.title, val.location_detail);
      });
    },
  },
  methods: {
    async book() {
      const date = moment(this.date);

      const valid = await this.$refs.description.validate();
      if (!valid) {
        this.$toast.error(`'사장님께 용무' 입력을 확인해주세요!`);
        return;
      }

      if (date.isBefore(moment())) {
        this.$toast.error('현재 시각보다 전에 예약을 할 수는 없습니다!');
        return;
      }

      const isWeekend = date.day() === 0 || date.day() === 6;
      if (isWeekend) {
        const start = this.barber.weekend.start.hour * 60 + this.barber.weekend.start.minute;
        const end = this.barber.weekend.end.hour * 60 + this.barber.weekend.end.minute;
        const selected = date.hour() * 60 + date.minute();
        if (selected < start || end - 30 < selected) {
          this.$toast.error('영업 시간이 아닙니다!');
          return;
        }
      } else {
        const start = this.barber.weekday.start.hour * 60 + this.barber.weekday.start.minute;
        const end = this.barber.weekday.end.hour * 60 + this.barber.weekday.end.minute;
        const selected = date.hour() * 60 + date.minute();
        if (selected < start || end - 30 < selected) {
          this.$toast.error('영업 시간이 아닙니다!');
          return;
        }
      }

      const checkBefore = moment(date).subtract(20, 'minute').subtract(1, 'minute');
      const checkAfter = moment(date).add(20, 'minute').add(1, 'minute');
      const reservations = this.reservations.filter(reservation => {
        // checkBefore <= reservation && reservation <= checkAfter
        const t = moment(reservation.time);
        return checkBefore.isBefore(t) && t.isBefore(checkAfter);
      });
      if (reservations.length > 0) {
        this.$toast.error('이미 예약된 시간과 겹칩니다. (이발시간: 30분)');
        for (const reservation of reservations) {
          const t = moment(reservation.time);
          this.$toast.error(`예약된 시간: ${t.format('HH:mm')} ~ ${t.add(30, 'minute').format('HH:mm')}`);
        }
        return;
      }

      const dateString = encodeURIComponent(date.toISOString());
      const description = this.description;
      this.$router.push(`/barbers/${this.barber._id}/book?time=${dateString}&description=${description}`);
    },
    drawMap(title, location) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(location, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          const container = this.$refs.map;
          const options = {
            center: coords,
            draggable: false,
            level: 3,
          };
          const map = new window.kakao.maps.Map(container, options);

          const marker = new window.kakao.maps.Marker({
            map,
            position: coords,
          });

          const infoWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="width: 150px; text-align:center; padding: 0.5rem 0.25rem">${title}</div>`,
            // content: `<div style="width: 150px; text-align:center; padding: 0.5rem 0.25rem">${val.title}</div>`,
          });
          infoWindow.open(map, marker);
        }
      });
    },
  },
};
</script>

<style scoped>
.barbershop-heading {
  height: 230px;
  font-size: 1.75rem;
  color: white;
  background: url(/img/shop1.jpg) center/cover no-repeat;
}

@media (min-width: 640px) {
  .barbershop-heading {
    height: 350px;
  }
}

.kakao-map {
  height: 200px;
}
@media (min-width: 640px) {
  .kakao-map {
    height: 350px;
  }
}
@media (min-width: 768px) {
  .kakao-map {
    height: 450px;
  }
}
</style>
